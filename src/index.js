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

const app = new Koa()

const isDevMode = process.env.NODE_ENV === 'production' ? false : true

const middleware = compose([
  koaBody(),
  statics(path.join(__dirname, '../public')),
  cors(),
  json({ pretty: false, param: 'pretty' }),
  helmet()
])

if(!isDevMode) {
  app.use(compress())
}

app.use(middleware)
app.use(router())

app.listen('8080', function() {
  console.log('http://127.0.0.1:8080')
})