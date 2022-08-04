const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const deps = require('../package.json').dependencies;
const CopyPlugin = require('copy-webpack-plugin');

const externalApps = require('../../config.apps');

const ingame = Boolean(process.env.APP_IN_GAME);
const remotes = ({ mode }) => {
  console.log("TOTAL REMOTES", Object.keys(externalApps).length)
  if (Object.keys(externalApps).length === 0) return {};
  
  return Object.keys(externalApps).reduce((prev, key) => {
    if (mode === 'production' || ingame) {
      return {
        ...prev,
        [key]: `${key}@https://cfx-nui-${key}/web/dist/remoteEntry.js`,
      };
    }

    return {
      ...prev,
      [key]: `${key}@http://localhost:3007/remoteEntry.js`,
    };
  }, {});
}

module.exports = (env, mode) => ({
  entry: './src/bootstrap.ts',
  output: {
    path: path.resolve(__dirname, '../../resources/html'),
    filename: '[name].js',
    clean: true,
  },
  devServer: {
    port: 3000,
    hot: true,
    devMiddleware: {
      writeToDisk: !!process.env.REACT_IN_GAME,
    },
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'layout',
      remotes: remotes(mode),
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './public/media',
          to: path.resolve(__dirname, '../../resources/html/media'),
          toType: 'dir',
        },
      ],
    }),
    new webpack.DefinePlugin({
      process: { env: {} },
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@os': path.resolve(__dirname, '../src/os/'),
      '@ui': path.resolve(__dirname, '../src/ui/'),
      '@common': path.resolve(__dirname, '../src/common/'),
      '@utils': path.resolve(__dirname, '../src/utils/'),
      '@apps': path.resolve(__dirname, '../src/apps/'),
      '@typings': path.resolve(__dirname, '../../typings/'),
      '@shared': path.resolve(__dirname, '../../shared'),
    },
  },
});
