import combineRouters from 'koa-combine-routers'
import publicRouter from './publicRouter'
import loginController from './loginRouter'
import userRouter from './userRouter'

const router = combineRouters(
  publicRouter,
  loginController,
  userRouter
)

export default router