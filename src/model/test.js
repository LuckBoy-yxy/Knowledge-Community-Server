import mongoose from '../config/DBHelpler'

// 定义数据表的骨架
const Schema = mongoose.Schema
const TestSchema = new Schema({
  'name': { type: String },
  'age': { type: Number },
  'email': { type: String }
})

// 通过数据库对象, 拿到对应的表
const USersModel = mongoose.model(
  'users',
  TestSchema
)

export default USersModel