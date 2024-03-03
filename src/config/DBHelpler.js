import mongoose from 'mongoose'
import config from './index'

// 连接数据库
// 也可以说是, 连接并获取到对应数据库的对象
mongoose.connect(config.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// 监听数据库连接 connected(成功) 事件
mongoose.connection.on('connected', () => {
  console.log('Mongoose connection open to' + config.DB_URL)
})

// 监听数据库连接 error(失败) 事件
mongoose.connection.on('error', err => {
  console.log('Mongoose connection err: ' + err)
})

// 监听断开连接 disconnected 事件
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection disconnected')
})

// 导出数据库对象
export default mongoose