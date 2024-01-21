import Router from '@koa/router'
import demoController from '../api/demoController'

const router = new Router({
  prefix: '/api'
})

router.get('/demo', demoController.demo)

export default router