import { BaseController, ViewResult, get, post, fromBody, fromQuery, logic } from './../base/BaseController';
import request from 'request';
import UserService from '../service/UserService';
import { abc } from '../logic/HomeLogic';
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
            return this.success({}, '登录成功');
        }
        return this.fail('登录失败');
    }
    @post()
    public async test(@fromBody() end?: Boolean) {
        request.post('http://localhost:6801/home/test', (error, response, body) => {
            if (error) {

            }
            console.log(error, body);
        })
        // let result = await UserService.saveAsync();
        // console.log(result);
        // console.log('----------------------requset-home');
        if (bool) {
            console.log(bool, '-------------------abc');
            // if (end) {
            //     bool = false;
            // }
            return this.success({}, '登录成功');
        } else {
            this.Response.status(401);
            return this.fail('请先登录', {}, 401);
        }
    }
    @post()
    @logic(abc)
    public abc(@fromBody() a: any, @fromBody() b: number) {
        return this.success({}, '请求成功');
    }
    @post()
    public baidu() {
        return this.success();
    }
}