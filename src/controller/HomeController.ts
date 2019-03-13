import { BaseController, ViewResult, auth, get, post, fromBody, fromQuery, logic } from './../base/BaseController';
import request from 'request';
import UserService from '../service/UserService';
export class HomeController extends BaseController {
    @get()
    @auth()
    public index() {
        return this.success('访问成功');
    }
    @post()
    public test() {
        return this.success('访问成功');
    }
}