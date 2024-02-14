// webpack.config.js
module.exports = [
    {
      mode: 'development',
      entry: {
       app: { 
        filename: 'index.js',
        import: './src/index.ts', },
       renderer: {
        filename: 'renderer.js',
        import: './src/renderer.ts'},
      preload: {
        filename: 'preload.js',
        import: './src/preload.ts'},
      },
      target: 'electron-renderer',
      devtool: "source-map",
      module: {
        rules: [{
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        }]
      },
      output: {
        path: __dirname + '/build',
      }
    }
  ];