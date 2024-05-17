import mongoose from '../config/DBHelpler'
import moment from 'moment'

const Schema = mongoose.Schema
const LinkSchema = new Schema({
  type: { type: String, default: 'link' },
  title: { type: String, default: '' },
  link: { type: String, default: '' },
  created: { type: Date },
  isTop: { type: String, default: '0' },
  sort: { type: String, default: '0' }
})

LinkSchema.pre('save', function (next) {
  // 这里 moment 中不需要将 this.created 传递进去, 因为这里是在向数据表中保存一条记录
  // 保存的时候, created 字段中是还没有值的; 这里需要做的就是在记录保存之前, 将当前的时间进行格式化之后, 存储到 created 字段中
  // this.created = moment(this.created).format('YYYY-MM-DD HH:mm:ss')
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const LinkModel = mongoose.model(
  'links',
  LinkSchema
)

export default LinkModel