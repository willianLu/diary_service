import { GetMysqlServiceAsync } from '../base/SqlService';
import { FindManyOptions, FindOneOptions, FindConditions, EntityManager } from 'typeorm';
import { User } from '../entity';
namespace UserService {
    export async function execLoginAndCreateUse(res: any) {
        let repo = await GetMysqlServiceAsync(User);
        let userInfo = await repo.findAsync({
            where: {
                openId: res.openid
            }
        });
        if (userInfo[0] && userInfo[0].id) {
            return userInfo[0];
        }
        let user = new User();
        user.openId = res.openid;
        return await repo.saveAsync(user);
    }
    export async function getUserInfoById(id: string) {
        let repo = await GetMysqlServiceAsync(User);
        return await repo.findOneAsync(id);
    }
}

export default UserService;