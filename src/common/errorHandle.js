import log4js from '../config/log4'

const logger = log4js.getLogger('error')
export default (ctx, next) => {
  return next().catch((err) => {
    logger.error(`${ctx.url} ${ctx.method} ${ctx.status} ${err.stack}`)
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