import { BaseController, ViewResult, get, post, fromBody, fromQuery } from './../base/BaseController';

export class LoginController extends BaseController {
    @post()
    public index(@fromBody('string') code: string) {
        console.log(code);
        // return this.success('登录成功', {
        //     token: '123456'
        // });
        return {
            errno: 0,
            errmsg: '登录成功',
            data: {
                token: '123456'
            }
        }
    }
}