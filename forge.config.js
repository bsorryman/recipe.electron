module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              name: 'main_window',
              html: './src/renderer/main_window/index.html',
              js: './src/renderer/main_window/renderer.js',
              preload: {
                js: './src/preload.js'
              }
            },
            {
              name: 'search_result',
              html: './src/renderer/search_result/index.html',
              js: './src/renderer/search_result/renderer.js',
              preload: {
                js: './src/preload.js'
              }
            },          
            {
              name: 'rcp_modal',
              html: './src/renderer/rcp_modal/index.html',
              js: './src/renderer/rcp_modal/renderer.js',
              preload: {
                js: './src/preload.js'
              }
            },                 
          ],
        },
      },
    },
  ],
};
