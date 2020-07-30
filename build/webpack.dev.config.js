const {merge} = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(baseConfig, {

    mode: 'development',

    devtool: 'eval-cheap-module-source-map',

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'public/css/[name].css'
        }),
        new webpack.HotModuleReplacementPlugin(), //js热更新 配合入口文件module.hot.accept方法
    ]
})
