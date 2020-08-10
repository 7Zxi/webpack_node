/**
 * res绑定view方法，用来区分不同环境下的视图渲染方式
 * 一定要挂载在路由加载之前
 * template: 视图路径
 * params: 渲染数据
 */

const path = require('path');
const fs = require('fs');
const request = require('../cores/httpsender');
const artTemplate = require('art-template');
const localhost = `http://127.0.0.1:${process.env.PORT || 3000}/views`;


const view = (req, res, next) => {

    res.view = async (template, renderData) => {
        let page = await getHtmlString(template)
        let html = '';

        // 视图中是否包含include
        if (htmlHasInclude(page)) {
            const cache = await parseInclude(page, renderData);
            let option = renderCacheHtml(cache)[0];
            html = option.html;
        }

        html = artTemplate.render(html, renderData);

        res.send(html);
    }

    next();
}


// 解析初始文档的include引入
async function parseInclude(html, includeData, cacheHtml = []) {
    const includeArr = htmlHasInclude(html);
    let option = {
        html,
        includeData
    }

    if (includeArr) {
        option.child = [];
        await appendIncludeChild(includeArr, includeData, option.child);
    }

    cacheHtml.push(option);

    return cacheHtml;

}

// 生成include的依赖数据结构
async function appendIncludeChild(includeArr, renderData, child) {

    for (let i = 0; i < includeArr.length; i++) {
        const list = includeArr[i];
        const {includeSrc, includeData, include} = splitInclude(list, renderData);
        let html = await getHtmlString(includeSrc);
        let option = {includeSrc, includeData, include, html};

        if (htmlHasInclude(html)) {
            option.child = [];
            await appendIncludeChild(htmlHasInclude(html), includeData, option.child);
        }

        child.push(option);
    }
}

// 拆分include: includeSrc 引入路径  includeData 渲染数据  include 缓存整个include作为后续替换
function splitInclude(include, renderData) {
    const includeArg = include.replace(/({{|}}|<%|%>)/g, '')
        .split(/[\(|\)|,|\s*|'|"]/g)
        .filter(data => data.length > 0);

    const includeSrc = includeArg[1];
    const dataName = includeArg[2];
    const includeData = dataName ? {[dataName]: renderData[dataName]} : null;

    return {includeSrc, includeData, include};
}

// 获取内存中目标路径的文档内容
async function getHtmlString(src) {
    if (process.env.NODE_ENV === 'development'){
        return await request({
            url: `${localhost}/${src}`,
            type: 'json'
        });
    }else{
        return fs.readFileSync(path.resolve(__dirname, '../dist/views', src), 'utf-8');
    }

}

// 文档是否包含include引入
function htmlHasInclude(html) {
    const reg = new RegExp('(<%|{{)\\s*include.*(}}|%>)', "ig");
    return html.match(reg);
}

// 渲染缓存的cacheHtml
function renderCacheHtml(cache) {

    cache.forEach(data => {
        if (data.child) {
            data.child.forEach(includeChild => {
                if (includeChild.child) {
                    let options = renderCacheHtml(data.child);
                    options.forEach(opt => {
                        data.html = data.html.replace(opt.include, opt.html);
                    })
                } else {
                    let str = includeChild.html;
                    if (includeChild.includeData) {
                        str = artTemplate.render(includeChild.html, includeChild.includeData);
                    }
                    data.html = data.html.replace(includeChild.include, str);
                }
            })
        } else {
            if (data.includeData) {
                data.html = artTemplate.render(data.html, data.includeData);
            }
        }
    });

    return cache;
}

module.exports = view;
