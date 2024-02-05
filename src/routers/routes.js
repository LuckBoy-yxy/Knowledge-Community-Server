import combineRouters from 'koa-combine-routers'
import publicRouter from './publicRouter'
import loginController from './loginRouter'

const router = combineRouters(
  publicRouter,
  loginController
)

export default router