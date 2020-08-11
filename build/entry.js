const glob = require('glob');
const fs = require('fs');
const path = require('path');
const {pageName, mode} = require('../config/index');
let entry = {};
let startPath = null;

console.log(`当前环境：${mode}`);
console.log('打包入口：');

if (pageName && pageName !== 'all') {
    startPath = path.resolve(`views/${pageName}`);
    addEntry(startPath, pageName);
} else {
    startPath = path.resolve('views')
    addEntry(startPath);
}

function addEntry(src, param) {
    const list = glob.sync(path.join(src, '/*'));
    if (list.length === 0) return console.log('请输入正确的打包路径');

    list.forEach(data => {
        let finalPath = data.split(/\\|\/|\\\\|\/\//).pop();

        if (fs.statSync(data).isFile()) {
            if (finalPath.includes('.html')) {
                let name = finalPath.split('.html')[0];
                let jsPath = path.join(__dirname, '../public/views', param || '', name, '/js/main.js');
                if (glob.sync(jsPath).length > 0) {
                    entry[name] = jsPath;
                } else {
                    console.log(`${name}页面 请添加入口main.js文件`)
                }
            }
        }
        else if (fs.statSync(data).isDirectory()) {
            if (finalPath !== 'dist') {
                addEntry(data, finalPath);
            }
        }
    })
}

console.log(entry);

module.exports = entry;
