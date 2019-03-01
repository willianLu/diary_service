import Request, { RequestResponse, CoreOptions, UrlOptions } from 'request';


interface Options {
    baseUrl?: string;
    url?: string;
    method?: string;
    headers?: any;
    timeout?: number;
    querystring?: any;
    data?: any,
    keepAlive?: boolean;
}

namespace HttpClient {
    export function request(options: any) {
        return new Promise((resolve, reject) => {
            if (!options.baseUrl) {
                reject('请求地址不正确');
            }
            Request(options, (err: any, response: RequestResponse, body: any) => {
                if(err){
                    
                }
            });
        });
    }
    function buildOption(options: Options) {
        let opt: CoreOptions & UrlOptions = { url: '' };
        
    }
}