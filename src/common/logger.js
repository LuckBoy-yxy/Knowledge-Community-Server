import log4js from '../config/log4'

const logger = log4js.getLogger('out')

export default async (ctx, next) => {
  const start = Date.now()
  await next()
  const resTime = Date.now() - start
  logger.warn(`[${ctx.method}] - ${ctx.url} - time: ${resTime / 1000}s`)
}