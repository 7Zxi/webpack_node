const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

module.exports = () => {
    let sessionOptions = {
        secret: 'test_session',
        resave: false,
        rolling: true,
        saveUninitialized: true,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            // session过期时间
            ttl: 7 * 24 * 60 * 60,
            // 过期自动清除
            autoRemove: 'native'
        })
    }

    return session(sessionOptions);
}
