import { GetMysqlServiceAsync } from '../base/SqlService';
import { FindManyOptions, FindOneOptions, FindConditions, EntityManager } from 'typeorm';
import { User, Menu } from '../entity';
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

    export async function getUserInfoAsync() {
        let repo = await GetMysqlServiceAsync(User);
        let ids = ['411debf1-0732-11e9-aef7-61e449b6b2ae', '43f34670-080b-11e9-939c-99b5e4ed02f8'];
        let user: FindManyOptions<User> = {
            where: {
                userName: 'langlang'
            }
        };
        return await repo.findAsync();
    }
    export async function saveAsync() {
        let repo = await GetMysqlServiceAsync(User);
        let userInfo = new User();
        userInfo.nickName = 'lu';
        userInfo.avatarUrl = '123';
        userInfo.openId = '123456';
        userInfo.phoneNumber = '123456';

        return await repo.saveAsync(userInfo);
    }
    export async function saveMultiAsync() {
        let repo = await GetMysqlServiceAsync(User);
        let userInfo: User[] = [];
        let user1 = new User();
        user1.userName = 'lu03';
        userInfo.push(user1);
        let user2 = new User();
        user2.userName = 'lu03';
        userInfo.push(user2);
        return await repo.saveMultiAsync(userInfo);
    }
    export async function updateAsync() {
        let repo = await GetMysqlServiceAsync(User);
        let user: Partial<User> = {
            userName: 'lu'
        }
        let userInfo: Partial<User> = {
            userName: 'langlang'
        }
        return await repo.updateAsync(user, userInfo);
    }
    export async function isDeleteAsync() {
        let repo = await GetMysqlServiceAsync(User);
        // let id = '411debf1-0732-11e9-aef7-61e449b6b2ae';
        let user: Partial<User> = {
            userName: 'lu03'
        }
        return await repo.isDelectAsync(user);
    }
    export async function deleteAsync() {
        let repo = await GetMysqlServiceAsync(User);
        let id = ['07d59a40-072e-11e9-9682-25cd6802d5aa', '252e47a0-0732-11e9-a4a3-69d7ec915672'];
        // let user: Partial<User> = {
        //     userName: 'lu03'
        // }
        return await repo.deleteAsync(id);
    }
    export async function incrementAsync() {
        let repo = await GetMysqlServiceAsync(User);
        let conditions: FindConditions<User> = {
            id: '43f34670-080b-11e9-939c-99b5e4ed02f8'
        }
        return await repo.incrementAsync(conditions, 'age', 3);
    }
    export async function findOneOrFailAsync() {
        let repo = await GetMysqlServiceAsync(User);
        let id = '43f34670-080b-11e9-939c-99b5e4ed02f8';
        let user: FindOneOptions<User> = {
            where: {
                userName: 'lu'
            }
        }
        return await repo.findOneOrFailAsync(id, user);
    }
    export async function queryAsync() {
        let repo = await GetMysqlServiceAsync(User);
        return await repo.queryAsync('SELECT * FROM user');
    }
    export async function transactionAsync() {
        let repo = await GetMysqlServiceAsync(User);
        let user = new User();
        user.userName = 'langlang';
        let menu = new Menu();
        menu.name = '诗文02';
        return await repo.transactionAsync(async (entityManager: EntityManager) => {
            let userResult = await entityManager.save(user);
            let menuResult = await entityManager.save(menu);
            return true;
        });
    }
}

export default UserService;