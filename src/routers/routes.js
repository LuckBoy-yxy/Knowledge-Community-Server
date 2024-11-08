import combineRouters from 'koa-combine-routers'
import publicRouter from './publicRouter'
import loginController from './loginRouter'
import userRouter from './userRouter'
import contentRouter from './contentRouter'
import commentsRouter from './commentsRouter'
import adminRouter from './adminRouter'

// const moduleFiles = require.context('./modules', true, /\.js$/)
// const modules = moduleFiles.keys().reduce((item, path) => {
//   const router = moduleFiles(path)
//   item.push(router.default)

//   return item
// }, [])

const router = combineRouters(
  // modules
  publicRouter,
  loginController,
  userRouter,
  contentRouter,
  commentsRouter,
  adminRouter
)

export default router