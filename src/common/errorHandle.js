export default (ctx, next) => {
  return next().catch((err) => {
    if (err.status == 401) {
      ctx.body = {
        code: 401,
        msg: 'Protected resource, use Authorization header to get access\n'
      }
    } else {
      // throw err
      ctx.status = err.status || 500
      ctx.body = Object.assign({
        code: 500,
        msg: err.message
      }, process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
      console.log(err.stack)
    }
  })
}