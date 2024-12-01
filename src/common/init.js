import config from '../config'
import UsersModel from '../model/User'
import { setValue } from '../config/RedisConfig'

export const run = async () => {
  if (config.adminEmail && config.adminEmail.length > 0) {
    const emails = config.adminEmail
    const arr = []
    for (let email of emails) {
      const user = await UsersModel.findOne({
        username: email
      })
      if (user) {
        arr.push(user._id)
      }
    }

    setValue('admin', JSON.stringify(arr))
  }
}