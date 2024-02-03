import Router from '@koa/router'
import PublicController from '../api/PublicController'

const router = new Router({
  prefix: '/api'
})

router.get('/getCaptcha', PublicController.getCaptcha)

export default router