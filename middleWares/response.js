const request = require('../cores/httpsender');
const artTemplate = require('art-template');

module.exports = {
    render(template = 'index.html', params) {
        return async (req, res, next) => {
            if(process.env.NODE_ENV === 'development'){
                const data = await request({url: `http://127.0.0.1:3000/views/${template}`, type: 'json'});
                const html = artTemplate.render(data, params || {user: req.session.user});
                res.send(html)
            }else{
                res.render(template, params || {user: req.session.user});
            }
        }
    },

    send(params = {}) {
        return (req, res, next) => {
            res.send(params);
        }
    },

    json(params = {}) {
        return (req, res, next) => {
            res.json(params);
        }
    }
}
