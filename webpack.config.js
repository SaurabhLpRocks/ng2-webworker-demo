const fs = require('fs');
const path = require('path');
const ConcatPlugin = require('webpack-concat-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');
const rxPaths = require('rxjs/_esm5/path-mapping');
const {
  NoEmitOnErrorsPlugin,
  SourceMapDevToolPlugin,
  NamedModulesPlugin
} = require('webpack');
const {
  InsertConcatAssetsWebpackPlugin,
  NamedLazyChunksWebpackPlugin,
  BaseHrefWebpackPlugin
} = require('@angular/cli/plugins/webpack');
const {
  CommonsChunkPlugin
} = require('webpack').optimize;
const {
  AngularCompilerPlugin
} = require('@ngtools/webpack');

const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
const entryPoints = ["inline", "polyfills", "sw-register", "styles", "vendor", "main"];
const minimizeCss = false;
const baseHref = "";
const deployUrl = "";
const postcssPlugins = function () {
  // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
  const importantCommentRe = /@preserve|@license|[@#]\s*source(?:Mapping)?URL|^!/i;
  const minimizeOptions = {
    autoprefixer: false,
    safe: true,
    mergeLonghand: false,
    discardComments: {
      remove: (comment) => !importantCommentRe.test(comment)
    }
  };
  return [
    postcssUrl({
      url: (URL) => {
        // Only convert root relative URLs, which CSS-Loader won't process into require().
        if (!URL.startsWith('/') || URL.startsWith('//')) {
          return URL;
        }
        if (deployUrl.match(/:\/\//)) {
          // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
          return `${deployUrl.replace(/\/$/, '')}${URL}`;
        } else if (baseHref.match(/:\/\//)) {
          // If baseHref contains a scheme, include it as is.
          return baseHref.replace(/\/$/, '') +
            `/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
        } else {
          // Join together base-href, deploy-url and the original URL.
          // Also dedupe multiple slashes into single ones.
          return `/${baseHref}/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
        }
      }
    }),
    autoprefixer(),
    customProperties({
      preserve: true
    })
  ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
};




module.exports = {
  "resolve": {
    "extensions": [
      ".ts",
      ".js"
    ],
    "modules": [
      "./node_modules",
      "./node_modules"
    ],
    "symlinks": true,
    "alias": rxPaths(),
    "mainFields": [
      "browser",
      "module",
      "main"
    ]
  },
  "resolveLoader": {
    "modules": [
      "./node_modules",
      "./node_modules"
    ]
  },
  "entry": {
    "main": [
      "./src\\main.ts"
    ],
    "polyfills": [
      "./src\\polyfills.ts"
    ],
    "styles": [
      "./node_modules\\bootstrap\\dist\\css\\bootstrap.css",
      "./node_modules\\typeface-exo\\index.css",
      "./node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css",
      "./node_modules\\ionicons\\scss\\ionicons.scss",
      "./node_modules\\font-awesome\\scss\\font-awesome.scss",
      "./node_modules\\nebular-icons\\scss\\nebular-icons.scss",
      "./node_modules\\socicon\\css\\socicon.css",
      "./node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css",
      "./src\\app\\@theme\\styles\\styles.scss"
    ],
    "webworker": [
      "./src/workerLoader.ts"
    ]
  },
  "output": {
    "path": path.join(process.cwd(), "dist"),
    "filename": "[name].bundle.js",
    "chunkFilename": "[id].chunk.js",
    "crossOriginLoading": false
  },
  "module": {
    "rules": [{
        "test": /\.html$/,
        "loader": "raw-loader"
      },
      {
        "test": /\.(eot|svg|cur)$/,
        "loader": "file-loader",
        "options": {
          "name": "[name].[hash:20].[ext]",
          "limit": 10000
        }
      },
      {
        "test": /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
        "loader": "url-loader",
        "options": {
          "name": "[name].[hash:20].[ext]",
          "limit": 10000
        }
      },
      {
        "exclude": [
          path.join(process.cwd(), "node_modules\\bootstrap\\dist\\css\\bootstrap.css"),
          path.join(process.cwd(), "node_modules\\typeface-exo\\index.css"),
          path.join(process.cwd(), "node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css"),
          path.join(process.cwd(), "node_modules\\ionicons\\scss\\ionicons.scss"),
          path.join(process.cwd(), "node_modules\\font-awesome\\scss\\font-awesome.scss"),
          path.join(process.cwd(), "node_modules\\nebular-icons\\scss\\nebular-icons.scss"),
          path.join(process.cwd(), "node_modules\\socicon\\css\\socicon.css"),
          path.join(process.cwd(), "node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css"),
          path.join(process.cwd(), "src\\app\\@theme\\styles\\styles.scss")
        ],
        "test": /\.css$/,
        "use": [
          "exports-loader?module.exports.toString()",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          }
        ]
      },
      {
        "exclude": [
          path.join(process.cwd(), "node_modules\\bootstrap\\dist\\css\\bootstrap.css"),
          path.join(process.cwd(), "node_modules\\typeface-exo\\index.css"),
          path.join(process.cwd(), "node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css"),
          path.join(process.cwd(), "node_modules\\ionicons\\scss\\ionicons.scss"),
          path.join(process.cwd(), "node_modules\\font-awesome\\scss\\font-awesome.scss"),
          path.join(process.cwd(), "node_modules\\nebular-icons\\scss\\nebular-icons.scss"),
          path.join(process.cwd(), "node_modules\\socicon\\css\\socicon.css"),
          path.join(process.cwd(), "node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css"),
          path.join(process.cwd(), "src\\app\\@theme\\styles\\styles.scss")
        ],
        "test": /\.scss$|\.sass$/,
        "use": [
          "exports-loader?module.exports.toString()",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "sass-loader",
            "options": {
              "sourceMap": false,
              "precision": 8,
              "includePaths": []
            }
          }
        ]
      },
      {
        "exclude": [
          path.join(process.cwd(), "node_modules\\bootstrap\\dist\\css\\bootstrap.css"),
          path.join(process.cwd(), "node_modules\\typeface-exo\\index.css"),
          path.join(process.cwd(), "node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css"),
          path.join(process.cwd(), "node_modules\\ionicons\\scss\\ionicons.scss"),
          path.join(process.cwd(), "node_modules\\font-awesome\\scss\\font-awesome.scss"),
          path.join(process.cwd(), "node_modules\\nebular-icons\\scss\\nebular-icons.scss"),
          path.join(process.cwd(), "node_modules\\socicon\\css\\socicon.css"),
          path.join(process.cwd(), "node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css"),
          path.join(process.cwd(), "src\\app\\@theme\\styles\\styles.scss")
        ],
        "test": /\.less$/,
        "use": [
          "exports-loader?module.exports.toString()",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "less-loader",
            "options": {
              "sourceMap": false
            }
          }
        ]
      },
      {
        "exclude": [
          path.join(process.cwd(), "node_modules\\bootstrap\\dist\\css\\bootstrap.css"),
          path.join(process.cwd(), "node_modules\\typeface-exo\\index.css"),
          path.join(process.cwd(), "node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css"),
          path.join(process.cwd(), "node_modules\\ionicons\\scss\\ionicons.scss"),
          path.join(process.cwd(), "node_modules\\font-awesome\\scss\\font-awesome.scss"),
          path.join(process.cwd(), "node_modules\\nebular-icons\\scss\\nebular-icons.scss"),
          path.join(process.cwd(), "node_modules\\socicon\\css\\socicon.css"),
          path.join(process.cwd(), "node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css"),
          path.join(process.cwd(), "src\\app\\@theme\\styles\\styles.scss")
        ],
        "test": /\.styl$/,
        "use": [
          "exports-loader?module.exports.toString()",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "stylus-loader",
            "options": {
              "sourceMap": false,
              "paths": []
            }
          }
        ]
      },
      {
        "include": [
          path.join(process.cwd(), "node_modules\\bootstrap\\dist\\css\\bootstrap.css"),
          path.join(process.cwd(), "node_modules\\typeface-exo\\index.css"),
          path.join(process.cwd(), "node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css"),
          path.join(process.cwd(), "node_modules\\ionicons\\scss\\ionicons.scss"),
          path.join(process.cwd(), "node_modules\\font-awesome\\scss\\font-awesome.scss"),
          path.join(process.cwd(), "node_modules\\nebular-icons\\scss\\nebular-icons.scss"),
          path.join(process.cwd(), "node_modules\\socicon\\css\\socicon.css"),
          path.join(process.cwd(), "node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css"),
          path.join(process.cwd(), "src\\app\\@theme\\styles\\styles.scss")
        ],
        "test": /\.css$/,
        "use": [
          "style-loader",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          }
        ]
      },
      {
        "include": [
          path.join(process.cwd(), "node_modules\\bootstrap\\dist\\css\\bootstrap.css"),
          path.join(process.cwd(), "node_modules\\typeface-exo\\index.css"),
          path.join(process.cwd(), "node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css"),
          path.join(process.cwd(), "node_modules\\ionicons\\scss\\ionicons.scss"),
          path.join(process.cwd(), "node_modules\\font-awesome\\scss\\font-awesome.scss"),
          path.join(process.cwd(), "node_modules\\nebular-icons\\scss\\nebular-icons.scss"),
          path.join(process.cwd(), "node_modules\\socicon\\css\\socicon.css"),
          path.join(process.cwd(), "node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css"),
          path.join(process.cwd(), "src\\app\\@theme\\styles\\styles.scss")
        ],
        "test": /\.scss$|\.sass$/,
        "use": [
          "style-loader",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "sass-loader",
            "options": {
              "sourceMap": false,
              "precision": 8,
              "includePaths": []
            }
          }
        ]
      },
      {
        "include": [
          path.join(process.cwd(), "node_modules\\bootstrap\\dist\\css\\bootstrap.css"),
          path.join(process.cwd(), "node_modules\\typeface-exo\\index.css"),
          path.join(process.cwd(), "node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css"),
          path.join(process.cwd(), "node_modules\\ionicons\\scss\\ionicons.scss"),
          path.join(process.cwd(), "node_modules\\font-awesome\\scss\\font-awesome.scss"),
          path.join(process.cwd(), "node_modules\\nebular-icons\\scss\\nebular-icons.scss"),
          path.join(process.cwd(), "node_modules\\socicon\\css\\socicon.css"),
          path.join(process.cwd(), "node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css"),
          path.join(process.cwd(), "src\\app\\@theme\\styles\\styles.scss")
        ],
        "test": /\.less$/,
        "use": [
          "style-loader",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "less-loader",
            "options": {
              "sourceMap": false
            }
          }
        ]
      },
      {
        "include": [
          path.join(process.cwd(), "node_modules\\bootstrap\\dist\\css\\bootstrap.css"),
          path.join(process.cwd(), "node_modules\\typeface-exo\\index.css"),
          path.join(process.cwd(), "node_modules\\roboto-fontface\\css\\roboto\\roboto-fontface.css"),
          path.join(process.cwd(), "node_modules\\ionicons\\scss\\ionicons.scss"),
          path.join(process.cwd(), "node_modules\\font-awesome\\scss\\font-awesome.scss"),
          path.join(process.cwd(), "node_modules\\nebular-icons\\scss\\nebular-icons.scss"),
          path.join(process.cwd(), "node_modules\\socicon\\css\\socicon.css"),
          path.join(process.cwd(), "node_modules\\pace-js\\templates\\pace-theme-flash.tmpl.css"),
          path.join(process.cwd(), "src\\app\\@theme\\styles\\styles.scss")
        ],
        "test": /\.styl$/,
        "use": [
          "style-loader",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "stylus-loader",
            "options": {
              "sourceMap": false,
              "paths": []
            }
          }
        ]
      },
      {
        "test": /\.ts$/,
        "loader": "@ngtools/webpack"
      }
    ]
  },
  "plugins": [
    new DefinePlugin({
      window: undefined,
    }),
    new NoEmitOnErrorsPlugin(),
    new ConcatPlugin({
      "uglify": false,
      "sourceMap": true,
      "name": "scripts",
      "fileName": "[name].bundle.js",
      "filesToConcat": [
        "node_modules\\pace-js\\pace.min.js",
        "node_modules\\tinymce\\tinymce.min.js",
        "node_modules\\tinymce\\themes\\modern\\theme.min.js",
        "node_modules\\tinymce\\plugins\\link\\plugin.min.js",
        "node_modules\\tinymce\\plugins\\paste\\plugin.min.js",
        "node_modules\\tinymce\\plugins\\table\\plugin.min.js",
        "src\\assets\\vendors\\echarts.min.js",
        "src\\assets\\vendors\\echarts.world.min.js",
        "node_modules\\chart.js\\dist\\Chart.min.js"
      ]
    }),
    new InsertConcatAssetsWebpackPlugin([
      "scripts"
    ]),
    new CopyWebpackPlugin([{
        "context": "src",
        "to": "",
        "from": {
          "glob": "assets/**/*",
          "dot": true
        }
      },
      {
        "context": "src",
        "to": "",
        "from": {
          "glob": "favicon.ico",
          "dot": true
        }
      },
      {
        "context": "src",
        "to": "",
        "from": {
          "glob": "favicon.png",
          "dot": true
        }
      },
      {
        "context": "node_modules\\leaflet\\dist\\images",
        "to": "./assets/img/markers",
        "from": {
          "glob": "**/*",
          "dot": true
        }
      }
    ], {
      "ignore": [
        ".gitkeep"
      ],
      "debug": "warning"
    }),
    new ProgressPlugin(),
    new CircularDependencyPlugin({
      "exclude": /(\\|\/)node_modules(\\|\/)/,
      "failOnError": false
    }),
    new NamedLazyChunksWebpackPlugin(),
    new HtmlWebpackPlugin({
      "template": "./src\\index.html",
      "filename": "./index.html",
      "hash": false,
      "inject": true,
      "compile": true,
      "favicon": false,
      "minify": false,
      "cache": true,
      "showErrors": true,
      "chunks": "all",
      "excludeChunks": [
        "webworker"
      ],
      "title": "Webpack App",
      "xhtml": true,
      "chunksSortMode": function sort(left, right) {
        let leftIndex = entryPoints.indexOf(left.names[0]);
        let rightindex = entryPoints.indexOf(right.names[0]);
        if (leftIndex > rightindex) {
          return 1;
        } else if (leftIndex < rightindex) {
          return -1;
        } else {
          return 0;
        }
      }
    }),
    new BaseHrefWebpackPlugin({}),
    new CommonsChunkPlugin({
      "name": "inline",
      "minChunks": null,
      "chunks": [
        "main",
        "polyfills",
        "styles"
      ]
    }),
    new CommonsChunkPlugin({
      "name": [
        "vendor"
      ],
      "minChunks": (module) => {
        return module.resource &&
          (module.resource.startsWith(nodeModules) ||
            module.resource.startsWith(genDirNodeModules) ||
            module.resource.startsWith(realNodeModules));
      },
      "chunks": [
        "main"
      ]
    }),
    new SourceMapDevToolPlugin({
      "filename": "[file].map[query]",
      "moduleFilenameTemplate": "[resource-path]",
      "fallbackModuleFilenameTemplate": "[resource-path]?[hash]",
      "sourceRoot": "webpack:///"
    }),
    new CommonsChunkPlugin({
      "name": [
        "main"
      ],
      "minChunks": 2,
      "async": "common"
    }),
    new NamedModulesPlugin({}),
    new AngularCompilerPlugin({
      "mainPath": "main.ts",
      "platform": 0,
      "hostReplacementPaths": {
        "environments\\environment.ts": "environments\\environment.ts"
      },
      "sourceMap": true,
      "tsConfigPath": "src\\tsconfig.app.json",
      "skipCodeGeneration": true,
      "compilerOptions": {},
      "entryModule": "app/app.module#AppModule"
    })
  ],
  "node": {
    "fs": "empty",
    "global": true,
    "crypto": "empty",
    "tls": "empty",
    "net": "empty",
    "process": true,
    "module": false,
    "clearImmediate": false,
    "setImmediate": false
  },
  "devServer": {
    "historyApiFallback": true
  }
};
