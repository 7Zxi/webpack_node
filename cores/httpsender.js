/**
 * @param type:请求数据类型 method:请求方法 url:请求地址 params:请求参数
 * @type {request}
 *
 * 注：提交json和上传文件时，一定要传特定的type
 */

const request = require('request');

module.exports = ({type, method = 'get', url, params = {}, headers}) => {
    let requestOptions = {};
    // 设置请求方法
    requestOptions.method = method.toUpperCase();
    // 设置请求地址
    requestOptions.url = url;
    // 设置超时
    requestOptions.timeout = 20 * 1000;

    switch (type) {
        case 'json':
            // json数据需要以application/json格式提交
            requestOptions.headers = {
                'content-type': 'application/json'
            };
            requestOptions.body = JSON.stringify(params);
            break;
        case 'form':
            if (typeof params.file === 'object') {
                params[params.file.fieldname] = {
                    value: params.file.buffer,
                    options: {
                        filename: params.file.originalname,
                        contentType: params.file.mimetype
                    }
                };
                delete params.file;
            }
            requestOptions.formData = params;
            break;
        default:
            if (requestOptions.method === 'GET') {
                // get请求参数拼接在url上
                requestOptions.qs = params;
            } else {
                // 非get请求，参数放在body中，以content-type: application/x-www-form-urlencoded头发送
                requestOptions.headers = {
                    'content-type': 'application/x-www-form-urlencoded'
                };
                requestOptions.form = params;
            }
    }

    // 如果有设置headers，合并到上面自动设置的headers里
    if(typeof headers === 'object'){
        Object.assign(headers, requestOptions.headers);
    }

    return new Promise((resolve, reject) => {
        request(requestOptions, (error, response, body) => {
            if(error){
                reject({
                    error,
                    type,
                    message: error.code === 'ETIMEDOUT' ? 'request timeout' : 'request error'
                })
            }else{
                if(type === 'json'){
                    resolve(body);
                }else{
                    try{
                        resolve(JSON.parse(body));
                    }catch(err){
                        // 捕捉json转换失败
                        reject({
                            err,
                            message: 'json conversion failure'
                        })
                    }
                }
            }
        })
    })
}
