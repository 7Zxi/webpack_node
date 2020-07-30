const User = require('../../db/blog/user');
const request = require('../../cores/httpsender');
const fs = require('fs');
module.exports = {
    register: async (req, res) => {
        const body = req.body;
        const data = await User.findOne({
            $or: [
                {email: body.email},
                {nickname: body.nickname}
            ]
        });
        if (data) {
            return res.json({code: 0, data: 'Account in place'});
        }

        //用户数据存储进session
        req.session.user = await new User(body).save();
        res.json({code: 1, data: 'ok'});
    },

    login: async (req, res, next) => {
        const body = req.body;
        const data = await User.findOne(body);
        if (data) {
            req.session.user = data;
            res.json({code: 1, data: 'Login success'});
        } else {
            res.json({code: 0, data: 'Email or password invalid'})
        }
    },

    logout: (req, res) => {
        req.session.user = null;
        res.redirect('/login');
    },

    upload: (req, res, next) => {
        res.json({code: 200, data: {msg: 'success upload', name: req.fileName}});
    },

    getVal: async (req, res, next) => {
        const data = await request({
            method: 'get',
            url: 'http://business-api.eg365.cn/api/share',
            params: {
                url: encodeURIComponent('http://business.eg365.cn/dbmeeting'),
                pid: 1
            }
        });
        res.json({code: 200, data});
    }
}
