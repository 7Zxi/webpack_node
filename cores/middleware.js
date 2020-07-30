const fs = require('fs');
const path = require('path');

const middlewarePath = path.join(__dirname, '../middleWares');
const middlewareList = fs.readdirSync(middlewarePath);
let middleware = {};

middlewareList.forEach(ware => {
    let param = ware.split('.js')[0];
    middleware[param] = require(`${middlewarePath}/${ware}`)
})

module.exports = middleware;
