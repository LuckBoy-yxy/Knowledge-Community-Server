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
import config from './config/index'
import errorHandle from './common/errorHandle'

const app = new Koa()

const isDevMode = process.env.NODE_ENV === 'production' ? false : true

const jwt = JWT({
  secret: config.JWT_SECRET
}).unless({
  path: [/^\/public/, /\/login/, /\/reg/]
})

const middleware = compose([
  // koa 的实例 app , 默认情况下是无法解析请求体 body 中的内容的
  // 我们需要给 app 去挂载 koaBody 这一个中间件之后
  // 在 api 接口接受到 post 请求, 所传递过来的请求体参数, 这样才会去对请求体 body 中的数据进行解析
  // 在 api 接口中, 可以通过 ctx.request 进行获取 body 中的参数

  // 在默认情况下, koaBody 是不会去接收头像上传的数据的
  koaBody({
    // 配置 multipart 表示接收头像上传的参数, 其属性默认值为 false
    multipart: true,
    // formidable 它主要去设置图片上传是的一些细节
    formidable: {
      // keepExtensions 属性表示保持文件的后缀
      keepExtensions: true,
      // maxFieldsSize 属性表示控制图片上传的大小
      maxFieldsSize: 5 *1024 *1024
    },
    // onError 事件表示, 在图片上传失败时, 可以在这去做统一的处理
    onError: err => {
      console.log('err', err)
    }
  }),
  statics(path.join(__dirname, '../public')),
  cors(),
  json({ pretty: false, param: 'pretty' }),
  helmet(),
  errorHandle,
  jwt
])

if(!isDevMode) {
  app.use(compress())
}

app.use(middleware)
app.use(router())

app.listen('3000', function() {
  console.log('http://127.0.0.1:3000')
})