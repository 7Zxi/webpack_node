/**
 * 控制器指向控制文件
 *@param filename 控制器文件路径:控制器方法
 */

const path = require('path');

module.exports = (fileName) => {
    let params = fileName.split(':');
    return require(path.join(__dirname, '../controllers', params[0]))[params[1]];
}
