// module.exports = (options, req) => {
//   return {
//     extendWebpack(config) {
//       if (options.mode === 'production')
//         config.output.publicPath = './'

//       return config
//     },
//     // sourceMap: false
//   }
// }

module.exports = {
  publicPath: './',
  sourceMap: false,
  html: {
    template: './index.html'
  }
}
