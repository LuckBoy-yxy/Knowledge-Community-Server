import moment from 'moment'
import mongoose from '../config/DBHelpler'

const Schema = mongoose.Schema
const PostTagsSchema = new Schema({
  tagName: { type: String, default: '' },
  tagClass: { type: String, default: '' }
})

PostTagsSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

PostTagsSchema.statics = {
  getList: function (options, page, pageSize) {
    return this.find(options)
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({ created: -1 })
  },
  countList: function (options) {
    return this.find(options).countDocuments()
  }
}

const PostTagsModel = mongoose.model(
  'post_tags',
  PostTagsSchema
)

export default PostTagsModel