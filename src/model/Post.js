import moment from 'moment'
import mongoose from '../config/DBHelpler'

const Schema = mongoose.Schema
const PostSchema = new Schema({
  uid: { type: String, ref: 'users' },
  title: { type: String },
  content: { type: String },
  created: { type: Date },
  catalog: { type: String },
  fav: { type: String },
  isEnd: { type: String },
  reads: { type: Number },
  answer: { type: Number },
  status: { type: String },
  isTop: { type: String },
  sort: { type: String },
  tags: { type: Array }
})

PostSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

PostSchema.statics = {
  /**
  * @description: 获取文章列表数据
  * @param {Object} options 筛选条件 
  * @param {String} sort 排序方式 
  * @param {Number} page 分页页码 
  * @param {Number} pageSize 分页条数 
  */
  getList: function (options, sort, page, pageSize) {
    return this.find(options)
      .sort({ [sort]: -1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .populate({
        path: 'uid',
        select: 'name isVip pic'
      })
  }
}

const PostModel = mongoose.model(
  'post',
  PostSchema
)

export default PostModel