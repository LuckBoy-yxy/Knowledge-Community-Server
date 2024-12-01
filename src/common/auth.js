import { getJWTPayload } from './utils'
import { getValue } from '../config/RedisConfig'

export default async (ctx, next) => {
  const headers = ctx.header.authorization
  if (typeof headers !== 'undefined') {
    const obj = await getJWTPayload(headers)
    if (obj._id) {
      ctx._id = obj._id
      const admins = JSON.parse(await getValue('admin'))
      if (admins.includes(obj._id)) {
        ctx.isAdmin = true
      } else {
        ctx.isAdmin = false
      }
    }
  }

  await next()
}