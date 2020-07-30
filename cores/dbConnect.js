/**
 * 连接数据库
 */
const env = require('dotenv').config().parsed;
const mongoose = require('mongoose');

module.exports = () => {
    return mongoose.connect(
        env.DB_URL,
        {useNewUrlParser: true, useUnifiedTopology: true}
    ).then(data => console.log(`mongodb 连接成功`));
}
