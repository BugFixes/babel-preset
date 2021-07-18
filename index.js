const {
  declare
} = require('@babel/helper-plugin-utils')

function getReactRemovePropTypesPluginConfig() {
  return {
    mode: 'unsafe-wrap'
  }
}

function getInlineEnvVarsPluginConfig(api, options) {
  const {
    environmentVars = []
  } = options

  return {
    include: environmentVars
  }
}

function getStyledComponentsPluginConfig(api) {
  const isDevelopment = api.env('development')
  const isTest = api.env('test')

  return {
    displayName: isDevelopment,
    fileName: false,
    minify: !isDevelopment && !isTest,
    pure: true,
    ssr: true,
    transpileTemplateLiterals: !isDevelopment && !isTest,
  }
}

function getTransformRuntimePluginConfig(api, options) {
  const {
    useRuntimeESModules = false
  } = options

  return {
    corejs: 3,
    helpers: true,
    useESModules: useRuntimeESModules,
    version: '^7.12.0',
  }
}

function getEnvPresetConfig(api, options) {
  const supportModules = api.caller(function (caller) {
    return caller.supportStaticESM
  })
  const {
    target, useESModules = supportModules
  } = options

  return {
    bugfixes: true,
    corejs: 3,
    modules: useESModules ? false : 'commonjs',
    shippedProposals: true,
    targets: [
      target === 'node' ? 'current node' : 'extends @bugfixes/browerslist-config'
    ],
    useBuiltIns: 'usage',
  }
}

function getTypeScriptPresetConfig() {
  return {
    allowDeclareFields: true,
    allowNamespaces: true,
    onlyRemoveTypeImports: true,
  }
}

module.exports = declare(function (api, options = {}) {
  const isDevelopment = api.env('development')

  api.assertVersion('^7.12.0')

  return {
    highlightCode: true,
    overrides: [
      {
        plugins: [
          require('@babel/plugin-transform-react-constant-elements'),
          [
            require('babel-plugin-transform-react-remove-prop-types'),
            getReactRemovePropTypesPluginConfig(),
          ],
        ],
        presets: [
          [
            require('@babel/preset-react'),
            {
              runtime: 'automatic'
            }
          ]
        ],
        test: /\.tsx?$/,
      },
      {
        presets: [
          [
            require('@babel/preset-typescipt'),
            getTypeScriptPresetConfig(),
          ],
        ],
        test: /\.tsx?$/,
      },
    ],
    plugins: [
      [
        require('babel-plugin-transform-inline-enviroment-variables'),
        getInlineEnvVarsPluginConfig(api, options),
      ],
      [
        require('babel-plugin-styled-components'),
        getStyledComponentsPluginConfig(api),
      ],
      [
        require('@babel/plugin-transform-runtime'),
        getTransformRuntimePluginConfig(api, options),
      ],
    ],
    presets: [
      [
        require('@babel/preset-env'),
        getEnvPresetConfig(api, options),
      ],
    ],
    sourceMaps: isDevelopment,
    sourceType: 'module',
  }
})
