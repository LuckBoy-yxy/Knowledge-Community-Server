import Router from '@koa/router'
import commentController from '../api/CommentController'

const router = new Router()

router.prefix('/comments')
router.post('/reply', commentController.addComment)
router.post('/update', commentController.updateComment)
router.get('/accept', commentController.setBest)
router.get('/hands', commentController.setHands)

export default router