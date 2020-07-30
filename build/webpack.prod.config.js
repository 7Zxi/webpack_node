const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css插件
const OSS = require('./upload-oss');

module.exports = merge(baseConfig, {

    mode: 'production',

    // 提取公共代码
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: { //抽离第三方插件
                    test: /node_modules/, //指定是node_modules下的第三方包
                    chunks: "initial",
                    name: 'vendor', //打包后的文件名，任意命名
                    priority: 10 //设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
                },
                utils: { //抽离自己写的公共代码，utils这个名字可以随意起
                    test: /\.js$/,
                    chunks: "initial",
                    name: 'utils', // 任意命名
                    minChunks: 2,   // 被引用过两次才抽离
                    minSize: 0 // 只要超出0字节就生成一个新包
                }
            }
        }
    },

    plugins: [
        // 抽离css
        new MiniCssExtractPlugin({
            filename: 'public/css/[name]-[contenthash:8].css'
        }),

        // 压缩css
        new OptimizeCssAssetsPlugin(),

        //...OSS,
    ]
})
