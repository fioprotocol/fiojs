const path = require('path');

module.exports = {
    entry: {
        chain_api: './src/chain-api.ts',
        chain_jsonrpc: './src/rpc-web.ts',
        chain_jssig: './src/chain-jssig.ts',
        chain_numeric: './src/chain-numeric.ts',
    },
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.web.json'
                    }
                },
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: x => x.chunk.name.replace('_', '-') + '-debug.js',
        library: '[name]',
        path: path.resolve(__dirname, 'dist-web', 'debug'),
    }
};
