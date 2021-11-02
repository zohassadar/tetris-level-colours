const webpack = require('webpack');
const path = require('path');

module.exports = (env={}, args={}) => {

    const config = {
        mode: env.dev ? 'development' : 'production',
        entry : {
            main: './src/main.js',
        },
        output: {
            path:     path.join(__dirname, 'static'),
            filename: '[name].js',
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: env.dev ? /node_modules/ : void 0,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    '@babel/preset-env',
                                    '@babel/preset-react',
                                ],
                                plugins: [
                                ]
                            }
                        }
                    ],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                __DEV__: env.dev
            }),
        ],
        resolve: {
            extensions: ['.js', '.json', '.jsx'],
            alias: { },
        },
        devtool: env.dev && 'source-map',
    };

    return config;
};
