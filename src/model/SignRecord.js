import mongoose from '../config/DBHelpler'
import moment from 'moment'

const Schema = mongoose.Schema

const SignRecordSchema = new Schema({
  uid: { type: String, ref: 'users' },
  created: { type: Date },
  favs: { type: Number }
})

SignRecordSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

SignRecordSchema.statics = {
  findByUid (uid) {
    return this.findOne({ uid: uid }).sort({ created: -1 })
  }
}

const SignRecordModel = mongoose.model(
  'sign_records',
  SignRecordSchema
)

export default SignRecordModel