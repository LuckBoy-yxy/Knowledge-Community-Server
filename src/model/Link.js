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
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const LinkModel = mongoose.model(
  'links',
  LinkSchema
)

export default LinkModel