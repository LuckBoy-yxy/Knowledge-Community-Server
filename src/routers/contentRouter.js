import Router from '@koa/router'
import contentController from '../api/ContentController'

const router = new Router()

router.prefix('/content')
router.post('/upload', contentController.uploadImg)
router.post('/add', contentController.addPost)
router.post('/update', contentController.updatePost)
router.get('/delete', contentController.deletePost)

export default router