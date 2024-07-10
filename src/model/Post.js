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
  isEnd: { type: String, default: '0' },
  reads: { type: Number, default: '0' },
  answer: { type: Number, default: '0' },
  status: { type: String, default: '0' },
  isTop: { type: String, default: '0' },
  sort: { type: String, default: 100 },
  tags: { type: Array, default: [] }
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
  },
  getTopWeek () {
    return this.find({
      created: {
        $gte: moment().subtract(7, 'days')
      }
    }, {
      answer: 1,
      title: 1
    }).sort({ answer: -1 }).limit(15)
  },
  findByTid (id) {
    return this.findOne({ _id: id }).populate(
      {
        path: 'uid',
        select: 'name pic isVip _id'
      }
    )
  }
}

const PostModel = mongoose.model(
  'post',
  PostSchema
)

export default PostModel