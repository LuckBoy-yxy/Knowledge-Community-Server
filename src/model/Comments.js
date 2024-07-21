import mongoose from "../config/DBHelpler"
import moment from 'moment'

const Schema = mongoose.Schema
const CommentsSchema = new Schema({
  tid: { type: String, ref: 'post'},
  uid: { type: String, ref: 'users' },
  cuid: { type: String, ref: 'users' },
  content: { type: String },
  created: { type: Date },
  hands: { type: Number, default: 0 },
  status: { type: String, default: '1' },
  isRead: { type: String, default: '0' },
  isBest: { type: String, default: '0' }
})

CommentsSchema.pre('save', function(next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

CommentsSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(error)
  }
})

CommentsSchema.statics = {
  findByTid: function (id) {
    return this.findByTid({ tid: id })
  },
  findByCid: function (id) {
    return this.findOne({ _id: id })
  },
  getCommentsList: function (id, page, pageSize) {
    return this.find({ tid: id }).populate({
      path: 'cuid',
      // select: '_id name pic isVip status'
      select: '_id name pic isVip',
      match: { status: { $eq: '0' } }
    }).populate({
      path: 'tid',
      select: '_id title status'
    }).skip(page * pageSize).limit(pageSize)
  },
  queryCount (id) {
    return this.find({ tid: id }).countDocuments()
  },
  getCommentPublic (id, page, pageSize) {
    return this.find({
      cuid: id
    }).populate({
      path: 'tid',
      select: '_id title'
    }).skip(page * pageSize).limit(pageSize).sort({
      created: -1
    })
  },
  getMsgList ({ id, page, pageSize }) {
    return this.find({
        uid: id,
        cuid: { $ne: id },
        isRead: { $eq: '0' },
        status: { $eq: '1' }
      }).populate({
        path: 'tid',
        select: '_id title'
      }).populate({
        path: 'cuid',
        select: '_id name',
      }).populate({
        path: 'uid',
        select: '_id name'
      }).skip(page * pageSize).limit(pageSize).sort({
        created: -1
      })
  },
  msgCount (id) {
    return this.find({
      uid: id,
      cuid: { $ne: id },
      isRead: { $eq: '0' },
      status: { $eq: '1' }
    }).countDocuments()
  }
}

const CommentsModel = mongoose.model('comments', CommentsSchema)

export default CommentsModel