import { getValue } from '../config/RedisConfig'
import config from '../config/index'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

export const getJWTPayload = token => {
  return jwt.verify(token.split(' ')[1], config.JWT_SECRET)
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

const getStats = path => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false)
      } else {
        resolve(stats)
      }
    })
  })
}
const mkdir = dir => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, err => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}
export const dirExists = async dir => {
  const isExists = await getStats(dir)
  // isExists.isDirectory() 如果返回值为 true , 则表示当前目录存在
  if (isExists && isExists.isDirectory()) {
    return true
  } else if (isExists) {
    return false
  }

  // 取得上级目录
  const tempDir = path.parse(dir).dir
  const status = await dirExists(tempDir)
  if (status) {
    const res = await mkdir(dir)
    return res
  } else {
    return false
  }
}