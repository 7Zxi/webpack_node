const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const routerLoad = require('./cores/route');
const cors = require('cors');
const view = require('./cores/view');
const session = require('./cores/session');
const dbConnect = require('./cores/dbConnect');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'dist/views'));
app.engine('html', require('express-art-template'))
app.set('view engine', 'art');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'dist/public')));


//dev模式时，启动webpack热更新
if (process.env.NODE_ENV === 'development') {
    const webpack = require('webpack');
    const webpackConfig = require('./build/webpack.dev.config');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const compiler = webpack(webpackConfig);
    // 启动webpack编译
    app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        logLevel: 'error',
    }));
    // 启动webpack热更新
    app.use(webpackHotMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        logLevel: 'error',
    }));
}


//解决接口跨域
app.use(cors());

//连接mongodb数据库
//dbConnect();

//添加session中间件
//app.use(session())

//添加视图渲染方式中间件
app.use(view);

//载入路由
routerLoad(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.send(err);
});

module.exports = app;
