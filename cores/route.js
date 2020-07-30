/**
 *路由加载文件
 */

const fs = require('fs');
const path = require('path');

//添加控制器
const control = require('./control');

//添加中间件
const middleware = require('./middleware');


//处理路由文件夹嵌套
const nesting = (filePath, app) => {
    const routeList = fs.readdirSync(filePath);
    routeList.forEach(list => {
        let src = path.join(filePath, list);
        if(fs.statSync(src).isDirectory()){
            nesting(src, app);
        }else{
            require(src)(app, control, middleware)
        }
    })
}

module.exports = (app) => {
    //路由目录路径
    const routePath = path.join(__dirname, '../routes');
    //加载路由
    nesting(routePath, app)
}
