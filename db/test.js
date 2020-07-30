const mongoose = require('mongoose');

//连接数据库
mongoose.connect(
    'mongodb://localhost:27017/sevenZxi',
    {useNewUrlParser: true, useUnifiedTopology: true}
).then(data => console.log(`连接成功：${data}`));

//定义表结构
const Schema = mongoose.Schema;
//定义表结构中属性的type
const studentsInfoSchema = new Schema({
    name: {type: String, required: true},
    age: {type: Number, required: true},
    gender: {type: Number, enum: [0, 1], required: true},
    hobbies: String,
    date: {type: Date, default: Date.now}
});


//将文档结构生成模型
const User = mongoose.model('User', studentsInfoSchema);

//新增数据
new User({
    name: 'qzx',
    age: 18,
    gender: 1
}).save().then(data => {
    console.log(`添加成功：${data}`)
}).catch(err => {
    console.log(`添加失败：${err}`)
})


//删除数据, deleteMany(全部删除)
//User.deleteOne({name: 'zs'}).then(data => console.log(data))


//更新数据, updateMany(全部更新)
//User.updateOne({name: 'qzx'}, {age: 18}).then(data => console.log(data));


//查询数据
User.find().then(data => console.log(data));
//条件查询，返回数组
//User.find({name: 'zs'}).then(data => console.log(data));
//只查找一个，返回对象
//User.findOne({name: 'zs'}).then(data => console.log(data));

