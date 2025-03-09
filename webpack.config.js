/**
 * @file webpack.config.js
 * @description فایل پیکربندی webpack برای پروژه
 */

/* به نام خدای نزدیک */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV === 'development';

// پیکربندی برای preload.ts
const preloadConfig = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/preload.ts',
  target: 'electron-preload',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'preload.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: 'tsconfig.electron.json'
          }
        }
      }
    ]
  },
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3',
    'electron': 'commonjs electron'
  }
};

// پیکربندی برای برنامه React
const rendererConfig = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/ui/index.tsx',
  target: 'web',
  devtool: isDevelopment ? 'inline-source-map' : false,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@utils': path.resolve(__dirname, 'src/utils')
    },
    fallback: {
      "path": false,
      "os": false,
      "crypto": false,
      "stream": false,
      "buffer": false,
      "util": false,
      "events": false
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                quietDeps: true,
                logger: {
                  warn: function(message) {
                    if (!message.includes('deprecated') && !message.includes('legacy JS API')) {
                      console.warn(message);
                    }
                  },
                  debug: function() {}
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/ui/index.html'),
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css'
    }),
    new ForkTsCheckerWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { 
          from: 'src/assets',
          to: 'assets',
          noErrorOnMissing: true
        }
      ]
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.IgnorePlugin({
      resourceRegExp: /\.map$/,
      contextRegExp: /html-entities/,
    }),
    ...(isDevelopment ? [] : [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ])
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    port: 3123,
    host: 'localhost',
    compress: true,
    hot: true,
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: true,
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      logging: 'error',
      webSocketURL: {
        hostname: 'localhost',
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    webSocketServer: {
      options: {
        clientTracking: false,
      }
    }
  },
  ignoreWarnings: [
    {
      module: /html-entities|source-map/,
    },
    {
      message: /source-map-loader/,
    },
    {
      message: /Failed to parse source map/,
    },
    {
      message: /sass-loader|node-sass/,
    }
  ],
  performance: {
    hints: false,
  }
};

module.exports = [rendererConfig, preloadConfig];
