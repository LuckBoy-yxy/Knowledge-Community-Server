import Router from '@koa/router'
import contentController from '../api/ContentController'
import userController from '../api/UserController'

const router = new Router()
router.prefix('/admin')

router.get('/get-tags', contentController.getTags)
router.post('/add-tag', contentController.addTag)
router.get('/remove-tag/:id', contentController.removeTag)
router.post('/edit-tag', contentController.updateTag)
router.get('/users', userController.getUsers)
router.post('/update-user', userController.updateUserById)
router.get('/delete-user/:id', userController.deleteUserById)
router.get('/check-username', userController.checkUserName)

export default router