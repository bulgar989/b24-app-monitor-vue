module.exports = {
  lintOnSave: false,
  publicPath: './',
  devServer: {
    port: 8080,
    setup (app) {
      app.post('*', (req, res) => {
        res.redirect(req.originalUrl)
      })
    }
  }
}
