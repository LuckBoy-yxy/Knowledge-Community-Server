import mongoose from '../config/DBHelpler'

// 定义数据表的骨架
const Schema = mongoose.Schema
const userSchema = new Schema({
  'username': { type: String },
  'password': { type: String }
})

// 通过数据库对象, 拿到对应的表
const UsersModel = mongoose.model(
  'users',
  userSchema
)

export default UsersModel