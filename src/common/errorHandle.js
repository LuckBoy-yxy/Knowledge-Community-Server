import ErrorRecord from '../model/ErrorRecord'
import UsersModel from '../model/User'
import log4js from '../config/log4'

const logger = log4js.getLogger('error')
export default async (ctx, next) => {
  try {
    await next()
    const isDevMode = process.env.NODE_ENV === 'production' ? false : true
    if (ctx.status !== 200 && isDevMode) {
      ctx.throw()
    }
  } catch (err) {
    logger.error(`${ctx.url} ${ctx.method} ${ctx.status} ${err.stack}`)

    let user = {}
    if (ctx._id) {
      user = await UsersModel.findOne({ _id: ctx._id })
    }
    await ErrorRecord.create({
      message: err.message,
      code: ctx.response.status,
      method: ctx.method,
      path: ctx.path,
      param: ctx.method === 'GET' ? ctx.query : ctx.request.body,
      username: user.username,
      stack: err.stack
    })

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
  }
}

// const logger = log4js.getLogger('error')
// export default (ctx, next) => {
//   return next().catch((err) => {
//     logger.error(`${ctx.url} ${ctx.method} ${ctx.status} ${err.stack}`)
//     if (err.status == 401) {
//       ctx.body = {
//         code: 401,
//         msg: 'Protected resource, use Authorization header to get access\n'
//       }
//     } else {
//       // throw err
//       ctx.status = err.status || 500
//       ctx.body = Object.assign({
//         code: 500,
//         msg: err.message
//       }, process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
//       console.log(err.stack)
//     }
//   })
// }