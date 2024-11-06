import Router from '@koa/router'
import contentController from '../api/ContentController'

const router = new Router()
router.prefix('/admin')

router.get('/get-tags', contentController.getTags)
router.post('/add-tag', contentController.addTag)
router.get('/remove-tag/:id', contentController.removeTag)
router.post('/edit-tag', contentController.updateTag)

export default router