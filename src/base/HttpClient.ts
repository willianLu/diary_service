const rp = require('request-promise');

namespace HttpClient {
    export function get(url = '', data = {}, options = {}) {
        return request(url, 'GET', data, options);
    }
    export function post(url = '', data = {}, options = {}) {
        return request(url, 'POST', data, options);
    }
    export function request(url = '', method = 'GET', data = {}, options: any = {}) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(['请求地址不正确']);
            }
            options = buildOptions(method, data, options);
            options.uri = url;
            rp(options).then((res: any) => {
                resolve([null, res]);
            }).catch((err: Error) => {
                reject([err.message]);
            });
        }).catch((err) => {
            return err;
        });
    }
}
function buildOptions(method = 'GET', data = {}, options: any = {}) {
    Object.assign(options, {
        json: true
    });
    options.method = method;
    switch (method.toLowerCase()) {
        case 'get':
            options.qs = data;
            break;
        case 'post':
            options.body = data;
            break;
    }
    return options;
}
export default HttpClient;
