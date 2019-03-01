import { BaseController, ViewResult, get, post, fromBody, fromQuery, logic } from './../base/BaseController';
import rq from 'request-promise';
import UserService from '../service/UserService';
import { indexLogic } from '../logic/LoginLogic'

export class LoginController extends BaseController {
    @post()
    @logic(indexLogic)
    public async index(@fromBody() code: string) {
        let options = {
            uri: 'https://api.weixin.qq.com/sns/jscode2session',
            qs: {
                appid: 'wx8e9f935aa475502d', // -> uri + '?access_token=xxxxx%20xxxxx'
                secret: '3d131508d916e1139b87ab4ce5ca06ad',
                js_code: code,
                grant_type: 'authorization_code'
            },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };
        let res = await rq(options);
        if (res && res.openid) {
            await UserService.execLoginAndCreateUse(res);
            return this.success({}, '登录成功');
        } else {
            return this.fail('登录失败，请稍后重试');
        }
    }
}