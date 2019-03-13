import * as core from 'express-serve-static-core';
import { SetActionArgsMetaData, SetActionLogicMetaData } from './RouterHandle';

export class BaseController {
    public Request: core.Request;
    public Response: core.Response;
    public userInfo: any;
    constructor(req: core.Request, res: core.Response) {
        this.Request = req;
        this.Response = res;
    }
    view(path: string, data?: any) {
        return new ViewResult(path, data);
    }
    custom(msg = '', data = {}, resCode: number) {
        return new ResponseBase(resCode, msg, data);
    }
    success(data = {}, msg = '') {
        return new ResponseBase(200, msg, data);
    }
    fail(msg = '', data = {}, resCode = 6000) {
        return new ResponseBase(resCode, msg, data);
    }
}

export class ViewResult {
    public path: string;
    public data: any;
    constructor(path: string = '', data: any = {}) {
        this.path = path;
        this.data = data;
    }
}

export class ResponseBase {
    public resCode: number;
    public msg: string;
    public data: any;
    constructor(resCode = 200, msg = '', data = {}, ) {
        this.resCode = resCode;
        this.msg = msg;
        this.data = data;
    }
}

/**
 * 设置方法访问方式为get
 *
 * @export
 * @returns
 */
export function get() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        SetActionDescriptorMap(target.constructor.name, propertyKey, 'GET');
    }
}

/**
 * 设置方法访问方式为post
 *
 * @export
 * @returns
 */
export function post() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        SetActionDescriptorMap(target.constructor.name, propertyKey, 'POST');
    }
}

/**
 * 设置请求登录认证auth装饰器
 *
 * @export
 * @returns
 */
export function auth() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        SetActionDescriptorMap(target.constructor.name, propertyKey, undefined, undefined, true);
    }
}


/**
 * 控制器方法参数定义类
 *
 * @export
 * @class ActionParamDescriptor
 */
export class ActionParamDescriptor {
    public fromType: string;
    public target: any;
    public actionName: string;
    public index: number;
    public paramName: string;
}


/**
 * 数据验证对象
 *
 * @export
 * @class LogicParam
 */
export class LogicParam {
    rules?: any;
    msg?: any;
    type?: string;
}

export function logic(rules: LogicParam = {}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        SetActionLogicMetaData(target, propertyKey, rules);
    }
}

export function fromBody() {
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        buildActionParamDes('body', target, propertyKey, parameterIndex);
    }
}

export function fromQuery() {
    return function (target: Object, propertyKey: string, parameterIndex: number) {
        buildActionParamDes('query', target, propertyKey, parameterIndex);
    }
}

function buildActionParamDes(fromType: string, target: any, actionName: string, index: number) {
    let paramName = getArgs(target[actionName], index);
    let paramDes = new ActionParamDescriptor();
    paramDes.paramName = paramName;
    paramDes.fromType = fromType;
    paramDes.target = target;
    paramDes.actionName = actionName;
    paramDes.index = index;
    SetActionArgsMetaData(paramDes);
}

function getArgs(action: any, index: number) {
    let actionStr = action.toString();
    actionStr = actionStr.replace(/\s*/g, '');
    let argsKey = actionStr.match(/\((.*?)\)/)[1].split(',');
    return argsKey[index];
}

export class ActionDescriptor {
    public id: string;
    public controllerName: string;
    public actionName: string;
    public method: string;
    public actionAlias: string;
    public routerName: string;
    public controller: any;
    public action: any;
    public isAuth: boolean = false;
}

let ActionDescriptorMap = new Map<string, Map<string, ActionDescriptor>>();
let ActionDesByIdMap: Map<string, Map<string, ActionDescriptor>>;

export function SetActionDescriptorMap(controllerName: string, actionName: string, method?: string, actionAlias?: string, isAuth?: boolean, routerName?: string, controller?: any, action?: any) {
    let controllerMap = ActionDescriptorMap.get(controllerName);
    if (!controllerMap) {
        controllerMap = new Map<string, ActionDescriptor>();
        ActionDescriptorMap.set(controllerName, controllerMap);
    }
    let actionMap = controllerMap.get(actionName);
    if (!actionMap) {
        actionMap = new ActionDescriptor();
        controllerMap.set(actionName, actionMap);
    }
    actionMap.controllerName = controllerName;
    actionMap.actionName = actionName;
    if (method) {
        actionMap.method = method;
    }
    if (actionAlias) {
        actionMap.actionAlias = actionAlias;
    }
    if (isAuth) {
        actionMap.isAuth = isAuth;
    }
    if (routerName) {
        actionMap.routerName = routerName;
    }
    if (controller) {
        actionMap.controller = controller;
    }
    if (action) {
        actionMap.action = action;
    }
    actionMap.id = actionMap.routerName;
    actionName = actionMap.actionAlias || actionMap.actionName;
    actionMap.id += actionName ? '_' + actionName : '';
    actionMap.id += actionMap.method ? '_' + actionMap.method : '';
}

export function GetActionDescriptorMap(routerName: string, actionName: string, method: string) {
    if (!ActionDesByIdMap) {
        buildMap();
    }
    let actionDesMap = ActionDesByIdMap.get(routerName);
    if (!actionDesMap) {
        return;
    }
    let id = routerName + '_' + actionName + '_' + method;
    return actionDesMap.get(id);
}

function buildMap() {
    if (ActionDescriptorMap.size === 0) {
        return;
    }
    ActionDesByIdMap = new Map<string, Map<string, ActionDescriptor>>();
    ActionDescriptorMap.forEach((actionDesMap) => {
        if (actionDesMap.size === 0) {
            return;
        }
        let routerName = '';
        let _actionDesMap = new Map<string, ActionDescriptor>();
        actionDesMap.forEach((item) => {
            item.routerName = item.routerName.toLowerCase();
            item.method = item.method.toLowerCase();
            routerName ? '' : routerName = item.routerName;
            _actionDesMap.set(item.id.toLowerCase(), item);
        });
        ActionDesByIdMap.set(routerName, _actionDesMap);
    })
}