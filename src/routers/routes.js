import combineRouters from 'koa-combine-routers'
import publicRouter from './publicRouter'
import loginController from './loginRouter'
import userRouter from './userRouter'
import contentRouter from './contentRouter'

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
  contentRouter
)

export default router