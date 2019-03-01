import * as core from 'express-serve-static-core';
import * as path from 'path';
import 'reflect-metadata';
import { SetActionDescriptorMap, GetActionDescriptorMap, ActionDescriptor, ViewResult, ActionParamDescriptor, ResponseBase, LogicParam } from './BaseController';

function find(controllers: any) {
    const routerNameArr = Object.getOwnPropertyNames(controllers);
    routerNameArr.forEach((routerName) => {
        if (routerName === '__esModule') {
            return;
        }
        let controllerDes = Object.getOwnPropertyDescriptor(controllers, routerName);
        if (controllerDes) {
            let controller = controllerDes.value;
            let controllerName = controller.name;
            let actionNameArr = Object.getOwnPropertyNames(controller.prototype);
            actionNameArr.forEach((actionName) => {
                if (actionName === 'constructor') {
                    return;
                }
                let actionDes = Object.getOwnPropertyDescriptor(controller.prototype, actionName);
                if (actionDes) {
                    let action = actionDes.value;
                    SetActionDescriptorMap(controllerName, actionName, undefined, undefined, undefined, routerName, controller, action);
                }
            })
        }
    });
}

function getPath(reqPath: string) {
    reqPath = path.normalize(reqPath);
    return reqPath.split(path.sep);
}

export function RouterHandle(app: core.Express, controllers: any) {
    find(controllers);
    app.use('/', (req: core.Request, res: core.Response, next: core.NextFunction) => {
        let reqPathArr = getPath(req.path);
        let routerName = (reqPathArr[1] || 'home').toLowerCase();
        let actionName = (reqPathArr[2] || 'index').toLowerCase();
        let method = req.method.toLowerCase();
        let actionDes = GetActionDescriptorMap(routerName, actionName, method);
        if (!actionDes) {
            actionDes = GetActionDescriptorMap(routerName, 'default', method);
        }
        if (actionDes && actionDes.method === method) {
            res.locals.actionDes = actionDes;
        }
        next && next();
    })
}

export function Router(req: core.Request, res: core.Response, next: core.NextFunction) {
    if (res.locals.actionDes) {
        let actionDes: ActionDescriptor = res.locals.actionDes;
        new Promise((resolve, reject) => {
            let controller = new actionDes.controller(req, res);
            let result = getActionLogic(req, actionDes.method, actionDes.controller, actionDes.actionName);
            if (result) {
                resolve(result);
            } else {
                let args = getActionArgs(req, actionDes.controller, actionDes.actionName);
                resolve(actionDes.action.apply(controller, args));
            }
        }).then((result) => {
            if (result instanceof ViewResult) {
                let viewPath = result.path.startsWith('/') ? result.path : actionDes.routerName + '/' + result.path;
                res.render(viewPath, result.data, (error: Error, html: any) => {
                    if (error) {
                        next && next(error);
                    } else {
                        res.send(html);
                        res.end();
                    }
                })
            } else if (typeof result !== 'undefined') {
                res.send(result);
                res.end();
            } else {
                process.nextTick(() => {
                    res.on('finish', () => {
                        res.end();
                    })
                })
            }
        }).catch((err) => {
            let msg = '系统错误';
            if (err instanceof Error) {
                msg = err.message;
            } else if (typeof err === 'string') {
                msg = err;
            }
            res.send(new ResponseBase(6000, msg));
            res.end();
        });
    } else {
        let err: Error = new Error('No found ' + req.path);
        (err as any).status = 404;
        next && next(err);
    }
}

const fromQueryMetadataKey = Symbol("fromQuery");

export function SetActionArgsMetaData(paramDes: ActionParamDescriptor) {
    let arr: ActionParamDescriptor[] = Reflect.getMetadata(fromQueryMetadataKey, paramDes.target, paramDes.actionName) || [];
    arr[paramDes.index] = paramDes;
    Reflect.defineMetadata(fromQueryMetadataKey, arr, paramDes.target, paramDes.actionName);
}

function getActionArgs(req: core.Request, controller: any, actionName: string) {
    let arr: ActionParamDescriptor[] = Reflect.getMetadata(fromQueryMetadataKey, controller.prototype, actionName) || [];
    let args: any[] = [];
    arr.forEach((element, index) => {
        args[index] = parseParam(req, element.fromType, element.paramName);
    });
    return args;
}

function parseParam(req: core.Request, fromType: string, paramName: string) {
    let arg;
    switch (fromType) {
        case 'query':
            arg = req.query[paramName];
            break;
        case 'header':
            arg = req.headers[paramName];
            break;
        case 'body':
        default:
            arg = req.body[paramName];
            break;
    }
    return arg;
}

const logicMetadataKey = Symbol("logic");

export function SetActionLogicMetaData(target: any, actionName: string, rules?: LogicParam) {
    Reflect.defineMetadata(logicMetadataKey, rules, target, actionName);
}

/**
 * 逻辑参数验证
 *
 * @param {core.Request} req
 * @param {string} method
 * @param {*} controller
 * @param {string} actionName
 * @returns
 */
function getActionLogic(req: core.Request, method: string, controller: any, actionName: string) {
    let logic = Reflect.getMetadata(logicMetadataKey, controller.prototype, actionName);
    let result = verifyData(req, logic, method);
    if (result) {
        if (typeof logic.errorHandle === 'function') {
            return logic.errorHandle(result[0], result[1], cbResposeBase);
        }
        return cbResposeBase(6000, result[0]);
    }
}

/**
 * 统一错误返回格式
 *
 * @param {number} code
 * @param {string} msg
 * @returns
 */
function cbResposeBase(code: number, msg: string) {
    return new ResponseBase(code, msg);
}


/**
 * 验证数据
 *
 * @param {core.Request} req
 * @param {*} logic
 * @param {string} method
 * @returns
 */
function verifyData(req: core.Request, logic: any, method: string) {
    if (logic instanceof Object && logic.rules instanceof Object) {
        let validateResult = {};
        let isObjectSkip = false;
        let _type = typeof logic.rules.type === 'string' ? logic.rules.type : '';
        switch (_type) {
            case 'string':
            case 'array':
            case 'object':
                logic.rules.method = logic.rules.method || method;
                break;
            default:
                isObjectSkip = true;
                break;
        }
        if (isObjectSkip) {
            for (let key in logic.rules) {
                logic.rules[key].method = logic.rules[key].method || method;
                let _data = getData(req, logic.rules[key].method, key);
                let _msg = logic.msg instanceof Object ? logic.msg[key] : logic.msg;
                let checkResult = checkData(req, logic.rules[key].method, logic.rules[key], _data, key, key, _msg, validateResult);
                if (checkResult) {
                    return checkResult;
                }
            }
        } else {
            return checkData(req, logic.rules.method, logic.rules, getData(req, logic.rules.method), '', '', logic.msg, validateResult);
        }
    }
}

function checkData(req: core.Request, method: string, rules: any, data: any, dataKey: string, chainedKey: string, msg: any, validateResult: any): any {
    if (!rules.required && !data) {
        return undefined;
    }
    let errMsg = typeof msg === 'string' ? msg : '';
    if (rules.required && !data) {
        return [errMsg || '缺少参数' + dataKey, chainedKey];
    }
    if (typeof rules.requiredIf === 'string') {

    }
    if ((rules.type === 'array' && !Array.isArray(data)) || (rules.type !== 'array' && rules.type !== typeof data)) {
        return [errMsg || '参数' + dataKey + '类型错误', chainedKey];
    }
    if (rules.type === 'string' && rules.trim) {
        data = data.replace(/^\s+|\s+$/g, '');
        assignHandle(req, method, chainedKey, data);
    }
    if (rules.type === 'string' && rules.length) {
        rules.max = rules.min = rules.length;
    }
    if (rules.type === 'object' && rules.children instanceof Object) {
        for (let key in rules.children) {
            let _chainedKey = chainedKey + '.' + key;
            let _msg = msg instanceof Object && msg[key] ? msg[key] : errMsg;
            let result = checkData(req, method, rules.children[key], data[key], key, _chainedKey, _msg, validateResult);
            if (result) {
                return result;
            }
        }
    } else if (rules.type === 'array' && typeof rules.children === 'object') {
        let isAllRules = {};
        for (let i = 0; i < data.length; i++) {
            let _chainedKey = chainedKey + '.' + i;
            let _msg = msg instanceof Array && msg[i] ? msg[i] : errMsg;
            let _rules;
            if (rules.children instanceof Object) {
                _rules = rules.children;
            } else {
                rules.children[i].isAll ? isAllRules = rules.children[i] : '';
                _rules = rules.children[i] ? rules.children[i] : isAllRules;
            }
            let result = checkData(req, method, _rules, data[i], dataKey + '[' + i + ']', _chainedKey, _msg, validateResult);
            if (result) {
                return result;
            }
        }
    } else {
        for (let key in rules) {
            switch (key) {
                case 'startsWith':
                    if (rules.type === 'string' && !data.startsWith(rules.startsWith)) {
                        return [errMsg || '参数' + dataKey + '不合乎规范', chainedKey];
                    }
                    break;
                case 'endsWith':
                    if (rules.type === 'string' && !data.endsWith(rules.endsWith)) {
                        return [errMsg || '参数' + dataKey + '不合乎规范', chainedKey];
                    }
                    break;
                case 'contain':
                    if (rules.type === 'string' && !data.includes(rules.contain)) {
                        return [errMsg || '参数' + dataKey + '不合乎规范', chainedKey];
                    }
                    break;
                case 'regPex':
                    if (rules.type === 'string' || rules.type === 'number') {
                        if (!rules.regPex.test(data)) {
                            return [errMsg || '参数' + dataKey + '不合乎规范', chainedKey];
                        }
                    }
                    break;
                case 'max':
                    if ((rules.type === 'string' && data.length > rules.max) || (rules.type === 'number' && data > rules.max)) {
                        return [errMsg || '参数' + dataKey + '不合乎规范', chainedKey];
                    }
                    break;
                case 'min':
                    if ((rules.type === 'string' && data.length < rules.min) || (rules.type === 'number' && data < rules.min)) {
                        return [errMsg || '参数' + dataKey + '不合乎规范', chainedKey];
                    }
                    break;
            }
        }
    }
}

function getData(req: core.Request, method: string, key: string = '') {
    if (method === 'get') {
        return key ? req.query[key] : req.query;
    } else if (method === 'post') {
        return key ? req.body[key] : req.body;
    }
}

/**
 * 逆解析数据，是req数据同步
 *
 * @param {core.Request} req
 * @param {string} method
 * @param {string} chainedKey
 * @param {*} data
 */
function assignHandle(req: core.Request, method: string, chainedKey: string, data: any) {
    if (chainedKey) {
        let keyArr = chainedKey.includes('.') ? chainedKey.split('.') : [chainedKey];
        let simulate: any = {};
        for (let i = keyArr.length - 1; i >= 0; i--) {
            let o: any = {};
            if (i === keyArr.length - 1) {
                o[keyArr[i]] = data;
            } else {
                o[keyArr[i]] = simulate;
            }
            simulate = o;
        }
        if (method === 'get') {
            Object.assign(req.query, simulate);
        } else if (method === 'post') {
            Object.assign(req.body, simulate);
        }
    } else {
        if (method === 'get') {
            req.query = data;
        } else if (method === 'post') {
            req.body = data;
        }
    }
}