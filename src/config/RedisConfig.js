import redis from 'redis'
import config from './index'
// import { promisify } from 'util'
import { promisifyAll } from 'bluebird'

// Redis 服务器配置
const options = {
  host: config.REDIS.host,
  port: config.REDIS.port,
  password: config.REDIS.password,
  detect_buffers: true,
  retry_strategy(options) {
    if (options.error && options.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection')
    }
    if (options.total_retry_time > 1000 * 60 *60) {
      return new Error('Retry time exhausted')
    }
    if (options.attempt > 10) {
      return undefined
    }
    return Math.min(options.attempt * 100, 3000)
  }
}

// 获取 Redis 服务实例, 通过实例去操作 Redis server
// const client = redis.createClient(options)
const client = promisifyAll(redis.createClient(options))
client.on('error', err => {
  console.log('Redis Client Error: ' + err)
})

// 插入一个键值
const setValue = (key, value) => {
  if (typeof value === undefined || typeof value === null || value === '') {
    return
  }
  if (typeof value === 'string') {
    return client.set(key, value)
  }
  if (typeof value === 'object') {
    Object.keys(value).forEach(item => {
      client.hset(key, item, value[item], redis.print)
    })
  }
}

// const getAsync = promisify(client.get).bind(client)
// 获取一个键值
const getValue = key => {
  // return getAsync(key)
  return client.getAsync(key)
}

// 获取一个哈希表
const getHValue = key => {
  // return promisify(client.hgetall).bind(client)(key)
  return client.hgetallAsync(key)
}

// 删除一个键值
const delValue = key => {
  client.del(key, (err, res) => {
    if (res === 1) {
      console.log('delete successfullu')
    } else {
      console.log('delete redis key error:' + err)
    }
  })
}

export default {
  client,
  setValue,
  getValue,
  getHValue,
  delValue
}