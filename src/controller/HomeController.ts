import { BaseController, ViewResult, get, post, fromBody, fromQuery } from './../base/BaseController';
import UserService from '../service/UserService'

export class HomeController extends BaseController {
    @get()
    public index() {
        return this.custom('修改失败', {}, 401);
    }
    @post()
    public async test(@fromBody() id: string, @fromBody() name: string, @fromBody() val: string) { 
        // let result = await UserService.getUserInfoAsync();
        // console.log(result);
        return this.success('访问成功')
    }
}