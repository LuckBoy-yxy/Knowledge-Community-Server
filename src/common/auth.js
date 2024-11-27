import { getJWTPayload } from './utils'

export default async (ctx, next) => {
  const headers = ctx.header.authorization
  if (typeof headers !== 'undefined') {
    const obj = await getJWTPayload(headers)
    if (obj._id) {
      ctx._id = obj._id
    }
  }

  await next()
}