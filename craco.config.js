const path = require('path');
const isWsl = require('is-wsl');
const fs = require('fs');
const glob = require('glob-all');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const PurgecssPlugin = require('purgecss-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CracoLessPlugin = require('craco-less');

const isEnvProduction = process.env.REACT_APP_IS_PRODUCTION === "true"

const findCssModuleRule = (config, test) => {
  let cssModuleRuleIndex;
  const cssLoaderModule = config.module.rules.find(ruleItem => {
    if (!ruleItem.oneOf || !ruleItem.oneOf.length) {
      return false;
    }
    cssModuleRuleIndex = ruleItem.oneOf.findIndex(
      loaderItem => loaderItem.test && loaderItem.test.toString() === test
    );
    return cssModuleRuleIndex !== -1;
  });
  const cssModuleRule = cssLoaderModule.oneOf[cssModuleRuleIndex];
  return cssModuleRule;
};

const removeMiniCssExtractPlugin = (config, test) => {
  const cssModuleRule = findCssModuleRule(config, test);
  cssModuleRule.use = cssModuleRule.use.map(loaderItem => {
    if (
      loaderItem.loader &&
      loaderItem.loader.includes('/mini-css-extract-plugin/')
    ) {
      loaderItem.loader = loaderItem.loader.replace(
        'mini-css-extract-plugin/dist/loader.js',
        'style-loader/dist/index.js'
      );
    }
    return loaderItem;
  });
  return config;
};

module.exports = {
  babel: {
    plugins: [
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true
        }
      ]
    ]
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Remove mini-css-extract-plugin destroys prod build
      webpackConfig = removeMiniCssExtractPlugin(webpackConfig, '/\\.css$/');
      webpackConfig = removeMiniCssExtractPlugin(
        webpackConfig,
        '/\\.module\\.(scss|sass)$/'
      );
      webpackConfig = removeMiniCssExtractPlugin(
        webpackConfig,
        '/\\.module\\.css$/'
      );
      webpackConfig.optimization.minimizer[0] = new TerserPlugin({
        terserOptions: {
          extractComments: 'all',
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
            drop_console: isEnvProduction
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        // Disabled on WSL (Windows Subsystem for Linux) due to an issue with Terser
        // https://github.com/webpack-contrib/terser-webpack-plugin/issues/21
        parallel: !isWsl,
        // Enable file caching
        cache: true,
        sourceMap: true
      })
      return webpackConfig;
    },
    plugins: [
      new PurgecssPlugin({
        paths: [
          resolveApp('public/index.html'),
          ...glob.sync(`${resolveApp('src')}/**/**/*`, { nodir: true })
        ]
      })
    ]
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          javascriptEnabled: true
        },
        modifyLessRule: (lessRule) => {
          lessRule.use.forEach(loaderItem => {
            if(loaderItem.loader.includes('/mini-css-extract-plugin/')){
              loaderItem.loader = loaderItem.loader.replace(
                'mini-css-extract-plugin/dist/loader.js',
                'style-loader/dist/index.js'
              );
            }
            return loaderItem
          })
          return lessRule
        }
      }
    }
  ]
};
