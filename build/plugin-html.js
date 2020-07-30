const HtmlWebpackPlugin = require('html-webpack-plugin');
const {mode} = require('../config/index');
const path = require('path');
const entry = require('./entry');
let plugins = [];

Object.keys(entry).forEach(data => {

    // 处理嵌套文件夹路径
    let dirPath = entry[data].split('\\');
    let startIndex = dirPath.indexOf('views') + 1;
    let endIndex = dirPath.indexOf('js');
    let pathFile = dirPath.slice(startIndex, endIndex).join('/') + '.html';

    let template = path.join(__dirname, '../views', pathFile);
    let filename = path.join(__dirname, '../dist/views', pathFile);

    plugins.push(new HtmlWebpackPlugin(createParams(template, filename, data)));
})

function createParams(template, filename, chunk) {
    let params = {
        template,
        filename,
        //hash: true,
        //cache: true,
        chunks: [chunk],
    };

    if (mode === 'production') {
        params.chunks.unshift('vendor', 'utils');
        params.minify = {
            removeComments: true, //清理html中的注释
            collapseWhitespace: true //清理html中的空格、换行符
        }
    }

    return params;
}

module.exports = plugins;
