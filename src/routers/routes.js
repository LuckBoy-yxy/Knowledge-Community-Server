import combineRouters from 'koa-combine-routers'
import demoRouter from './demoRouter'

const router = combineRouters(
  demoRouter
)

export default router