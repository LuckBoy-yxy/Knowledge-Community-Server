import Router from '@koa/router'
import userController from '../api/UserController'
import contentController from '../api/ContentController'
import errorController from '../api/ErrorController'

const router = new Router()

router.prefix('/user')

router.get('/fav', userController.userSign)
router.post('/basic', userController.updateUserInfo)
router.post('/change-password', userController.changePasswd)
router.get('/set-collect', userController.setCollect)
router.get('/post', contentController.getPostByUid)
router.get('/del-post', contentController.delPostByUid)
router.get('/collect', userController.getCollectByUid)
router.get('/get-msg', userController.getMsg)
router.get('/set-msg', userController.setMsg)
router.post('/add-error', errorController.addError)

export default router