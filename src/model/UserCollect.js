import moogoose from '../config/DBHelpler'
import moment from 'moment'

const Schema = moogoose.Schema

const UserCollectSchema = new Schema({
  uid: { type: String },
  tid: { type: String },
  title: { type: String },
  created: { type: Date }
})

UserCollectSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})
UserCollectSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(error)
  }
})

UserCollectSchema.statics = {
  queryCollectCount (options) {
    return this.find(options).countDocuments()
  },
  queryCollectByUserId (uid, page, pageSize) {
    return this.find({ uid: uid })
      .skip(page * pageSize)
      .limit(pageSize)
      .sort(['created', -1])
  },
  getListByUid (id, page, pageSize) {
    return this.find({ uid: id })
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({ created: -1 })
  },
  countByUid (id) {
    return this.find({ uid: id }).countDocuments()
  }
}

const UserCollect = moogoose.model('user_collect', UserCollectSchema)
export default UserCollect