import combineRouters from 'koa-combine-routers'
import publicRouter from './publicRouter'

const router = combineRouters(
  publicRouter
)

export default router