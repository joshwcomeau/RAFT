module.exports = {
  type: 'web-module',
  build: {
    externals: {},
    global: 'RAFT',
    jsNext: true,
    umd: true,
  },
  karma: {
    frameworks: ['mocha', 'chai', 'chai-as-promised'],
    plugins: [
      require('karma-chai-plugins') // Provides chai, chai-as-promised, ...
    ]
  }
}
