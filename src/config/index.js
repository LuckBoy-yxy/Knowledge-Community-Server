import path from 'path'

const DB_URL = 'mongodb://test:123456@192.168.27.147:27017/testdb'
const REDIS = {
  host: '192.168.27.147',
  port: 15001,
  password: '123456'
}
const JWT_SECRET = 'x7&%&1YR%1*1P1$QV$&M-@W1Zx#M*&V1V1x-=^&NXQX#&xX7%YNZ&N0-xVZ=PVZ!'
const baseUrl = process.env.NODE_ENV === 'production' ? 'http://www.toimc.com' : 'http://localhost:8080'
const uploadPath = process.env.NODE_ENV === 'production' ? 'app/public' : path.join(path.resolve(__dirname), '../../public')

export default {
  DB_URL,
  REDIS,
  JWT_SECRET,
  baseUrl,
  uploadPath
}