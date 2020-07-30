/**
 * 文件上传中间件
 * @params fileSize 文件上传大小限制, 单位 M
 */

const env = require('dotenv').config().parsed;
const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const multer = require('multer');
const OSS = require('ali-oss');

const store = OSS({
    region: env.REGION,
    accessKeyId: env.ACCESSKEYID,
    accessKeySecret: env.ACCESSKEYSECRET,
    bucket: env.BUCKET
});

const uploadOSS = async (fileName) => {
    const filePath = path.join(__dirname, '../uploads', fileName);
    const result = await store.put(`uploads/${fileName}`, filePath);

    if (result.res.status === 200) {
        return fs.unlinkSync(filePath);
    } else {
        return result;
    }
}

module.exports = (fileSize) => {
    let fileName = '';

    const M = 1024 * 1024;
    //默认上传文件大小
    fileSize = fileSize || 5 * M;
    //默认支持的文件上传类型
    let acceptSourceType = {
        png: 'image/png',
        jpg: 'image/jpeg',
        gif: 'image/gif',
        txt: 'text/plain',
        mp4: 'video/mpeg4',
        avi: 'video/avi',
        wmv: 'video/x-ms-wmv',
        mp3: 'audio/mp3'
    };
    //指定存储位置
    const storage = multer.diskStorage({
        //设置磁盘存放的文件夹
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../uploads'));
        },
        //设置文件名
        filename: (req, file, cb) => {
            const map = Object.entries(acceptSourceType)
                .filter(val => val.indexOf(file.mimetype) > -1)[0];

            fileName = `${md5(Date.now, file.originalname)}.${map[0]}`;
            cb(null, fileName);
        }
    })

    let multerOpts = {
        storage,
        limits: {
            fileSize
        },
        fileFilter: (req, file, cb) => {
            if (Object.values(acceptSourceType).includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(' Unsupported file upload format'))
            }
        }
    }

    const multerAny = multer(multerOpts).any();

    return (req, res, next) => {
        multerAny(req, res, async err => {
            if (err) {
                return res.json({code: 500, error: err});
            }

            const result = await uploadOSS(fileName);
            if (result) {
                return res.json({code: 500, error: result});
            }

            req.fileName = fileName;
            next();
        })
    }
}
