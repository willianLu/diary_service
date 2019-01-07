import { BaseController, ViewResult, get, post, fromBody, fromQuery } from './../base/BaseController';
import UserService from '../service/UserService';
let bool = true;
// let isLogin = false;
export class HomeController extends BaseController {
    @get()
    public index() {
        return this.custom('修改失败', {}, 401);
    }
    @post()
    public login(@fromBody() isLogin: Boolean) {
        if (isLogin) {
            bool = true;
            return this.success('登录成功');
        }
        return this.fail('登录失败');
    }
    @post()
    public async test(@fromBody() end?: Boolean) {
        // let result = await UserService.saveAsync();
        // console.log(result);
        // console.log('----------------------requset-home');
        if (bool) {
            // if (end) {
            //     bool = false;
            // }
            return this.success('登录成功');
        } else {
            this.Response.status(401);
            return this.fail('请先登录', {}, 401);
        }
    }
    @post()
    public abc() {
        return this.success('请求成功');
    }
}