import Router from '@koa/router'
import publicController from '../api/PublicController'
import contentController from '../api/ContentController'
import userController from '../api/UserController'
import commentController from '../api/CommentController'

const router = new Router()

router.prefix('/public')
router.get('/getCaptcha', publicController.getCaptcha)
router.get('/list', contentController.getPostList)
router.get('/tipsOrlinks', contentController.getTipsOrLinks)
router.get('/topWeek', contentController.getTopWeek)
router.get('/reset-email', userController.updateUserName)
router.get('/content/detail', contentController.getPostDetail)
router.get('/comments', commentController.getComments)
router.get('/base-user-info', userController.getBaseUserInfo)
router.get('/latest-post', contentController.getPublicPostByUid)
router.get('/latest-comment', commentController.getPublicCommentList)

export default router