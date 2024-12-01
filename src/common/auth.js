import { getJWTPayload } from './utils'
import { getValue } from '../config/RedisConfig'
import config from '../config'
import adminController from '../api/AdminController'

export default async (ctx, next) => {
  const headers = ctx.header.authorization
  if (typeof headers !== 'undefined') {
    const obj = await getJWTPayload(headers)
    if (obj._id) {
      ctx._id = obj._id
      const admins = JSON.parse(await getValue('admin'))
      if (admins.includes(obj._id)) {
        ctx.isAdmin = true
        await next()
        return
      } else {
        ctx.isAdmin = false
      }
    }
  }

  const { publicPath } = config
  if (publicPath.some(item => item.test(ctx.url))) {
    await next()
    return
  }
  const operations = await adminController.getOperations(ctx)
  if (operations.includes(ctx.url)) {
    await next()
  } else {
    ctx.throw(401)
  }
}