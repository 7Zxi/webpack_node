const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//定义用户数据属性
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    create_time: {
        type: Date,
        default: Date.now
    },
    last_modified_time: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: '/public/img/avatar_default.png'
    },
    gender: {
        type: Number,
        //男：1， 女：0，保密：-1
        enum: [-1, 0, 1],
        default: -1
    },
    bio: {
        type: String,
        default: ''
    },
    birthday: String,
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    }
})

module.exports = mongoose.model('User', userSchema);
