import Koa from 'koa'
import path from 'path'
import router from './routers/routes'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import koaBody from 'koa-body'
import statics from 'koa-static'
import json from 'koa-json'
import compose from 'koa-compose'
import compress from 'koa-compress'
import JWT from 'koa-jwt'
// import logger from 'koa-logger'

import config from './config/index'
import WebSocketServer from './config/WebSocket'
import log4js from './config/log4'

import errorHandle from './common/errorHandle'
import auth from './common/auth'
import { run } from './common/init'
import logger from './common/logger'

const app = new Koa()
const ws = new WebSocketServer()
ws.init()
global.ws = ws

const isDevMode = process.env.NODE_ENV === 'production' ? false : true

const jwt = JWT({
  secret: config.JWT_SECRET
}).unless({
  path: [/^\/public/, /\/login/, /\/reg/]
})

const middleware = compose([
  logger,
  koaBody({
    multipart: true,
    formidable: {
      keepExtensions: true,
      maxFieldsSize: 5 *1024 *1024
    },
    onError: err => {
      console.log('err', err)
    }
  }),
  statics(path.join(__dirname, '../public')),
  cors(),
  json({ pretty: false, param: 'pretty' }),
  helmet(),
  errorHandle,
  jwt,
  auth,
  // logger()
  isDevMode ? log4js.koaLogger(log4js.getLogger('http'), { level: 'auto' }) :
  log4js.koaLogger(log4js.getLogger('access'), { level: 'auto' })
])

if(!isDevMode) {
  app.use(compress())
}

app.use(middleware)
app.use(router())

app.listen('3000', function() {
  console.log('http://127.0.0.1:3000')
  run()
})