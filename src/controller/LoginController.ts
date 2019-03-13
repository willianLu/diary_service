import { BaseController, ViewResult, get, post, fromBody, fromQuery, logic } from './../base/BaseController';
import httpClient from './../base/HttpClient';
import Token from './../base/Token';
import UserService from '../service/UserService';
import { indexLogic } from '../logic/LoginLogic';

export class LoginController extends BaseController {
    @post()
    @logic(indexLogic)
    public async index(@fromBody() code: string) {
        let [error, res] = await httpClient.get('https://api.weixin.qq.com/sns/jscode2session', {
            appid: 'wx8e9f935aa475502d',
            secret: '3d131508d916e1139b87ab4ce5ca06ad',
            js_code: code,
            grant_type: 'authorization_code'
        });
        if (res && res.openid) {
            let userInfo = await UserService.execLoginAndCreateUse(res);
            let token = Token.CreateToken(userInfo.id, userInfo.openId, new Date(), undefined);
            return this.success({
                token: token,
                userInfo: {
                    userName: userInfo.userName,
                    avatarUrl: userInfo.avatarUrl
                }
            }, '登录成功');
        } else {
            return this.fail('登录失败，请稍后重试');
        }
    }
}