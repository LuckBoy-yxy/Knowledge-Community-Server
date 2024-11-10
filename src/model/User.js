import mongoose from '../config/DBHelpler'
import moment from 'moment'

// 定义数据表的骨架
const Schema = mongoose.Schema
const userSchema = new Schema({
  'username': { type: String, index: { unique: true }, sparse: true },
  'name': { type: String },
  'password': { type: String },
  'created': { type: Date },
  'updated': { type: Date },
  'favs': { type: Number, default: 100 },
  'gender': { type: String, default: '' },
  'roles': { type: Array, default: ['user'] },
  'pic': { type: String, default: '/images/shark.gif' },
  'mobile': { type: String, match: /^1[3-9](\d{9})$/, default: '' },
  'status': { type: String, default: '0' },
  'regmark': { type: String, default: '' },
  'location': { type: String, default: '' },
  'isVip': { type: String, default: '0' },
  'count': { type: Number, default: 0 }
})

userSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})
userSchema.pre('update', function (next) {
  this.updated = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})
userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Mongoose has a duplicate key'))
  } else {
    next(error)
  }
})

userSchema.statics = {
  findById (id) {
    return this.findOne({ '_id': id }, {
      password: 0,
      username: 0,
      mobile: 0
    })
  },
  getList: function (options, page, pageSize, sort) {
    let query = {}
    if (typeof options.search !== 'undefined') {
      if (typeof options.search === 'string' && options.search.trim() !== '') {
        if (['name', 'username'].includes(options.item)) {
          query[options.item] = { $regex: new RegExp(options.search) }
        } else {
          query[options.item] = options.search
        }
      }
      if (options.item === 'created') {
        const start = options.search[0]
        const end = options.search[1]
        query = { created: { $gte: new Date(start) ,$lt: new Date(end) } }
      }
      if (options.item === 'roles') {
        query = { roles: { $in: options.search } }
      }
    }
    // return this.find({...options}, { password: 0, mobile: 0 })
    return this.find(query, { password: 0, mobile: 0 })
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({ [sort]: -1 })
  },
  countList: function (options = {}) {
    return this.find(options).countDocuments()
  }
}

// 通过数据库对象, 拿到对应的表
const UsersModel = mongoose.model(
  'users',
  userSchema
)

export default UsersModel