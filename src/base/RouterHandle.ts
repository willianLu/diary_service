import * as core from 'express-serve-static-core';
import * as path from 'path';
import 'reflect-metadata';
import { SetActionDescriptorMap, GetActionDescriptorMap, ActionDescriptor, ViewResult, ActionParamDescriptor } from './BaseController';

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
            let args = getActionArgs(req, actionDes.controller, actionDes.actionName);
            resolve(actionDes.action.apply(controller, args));
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
        });
    } else {
        let err: Error = new Error('No found ' + req.path);
        (err as any).status = 404;
        next && next(err);
    }
}

const fromQueryMetadataKey = Symbol("fromQuery");

export function SetActionArgsMetaData(paramDes: ActionParamDescriptor) {
    let arr: ActionParamDescriptor[] = [];
    arr = Reflect.getMetadata(fromQueryMetadataKey, paramDes.target, paramDes.actionName) || [];
    arr.push(paramDes);
    Reflect.defineMetadata(fromQueryMetadataKey, arr, paramDes.target, paramDes.actionName);
}

function getActionArgs(req: core.Request, controller: any, actionName: string) {
    let arr: ActionParamDescriptor[] = Reflect.getMetadata(fromQueryMetadataKey, controller.prototype, actionName);
    let args = [arr.length];
    arr.forEach((element) => {
        args[element.index] = parseParam(req, element.fromType, element.paramName);
    });
    return args;
}

function parseParam(req: core.Request, fromType: string, paramName: string) {
    switch (fromType) {
        case 'query':
            return getParamFromReq(req.query, paramName);
        case 'header':
            return getParamFromReq(req.headers, paramName);
        case 'body':
        default:
            return getParamFromReq(req.body, paramName);
    }
}

function getParamFromReq(data: any, paramName: string) {
    return data[paramName];
}