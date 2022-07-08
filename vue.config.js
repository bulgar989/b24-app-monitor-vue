module.exports = {
  lintOnSave: false,
  publicPath: './',
  devServer: {
    setup (app) {
      app.post('*', (req, res) => {
        res.redirect(req.originalUrl)
      })
    }
  }
}
