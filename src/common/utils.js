import { getValue } from '../config/RedisConfig'
import config from '../config/index'
import jwt from 'jsonwebtoken'

export const getJWTPayload = token => {
  return jwt.verity(token.split(' ')[1], config.JWT_SECRET)
}

export const checkCode = async (key, value) => {
  const redisData = await getValue(key)
  if (redisData !== null) {
    if (redisData.toLowerCase() === value.toLowerCase()) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}