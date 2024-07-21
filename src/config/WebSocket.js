import WebSocket from 'ws'
import { getJWTPayload } from '../common/utils'

class WebSocketServer {
  constructor (config = {}) {
    const defaultConfig = {
      port: 3012,
      timeInterval: 30 * 1000,
      isAuth: true
    }
    const finalConfig = { ...defaultConfig, ...config }
    this.wss = {}
    // this.interval = finalConfig.timeInterval
    this.interval = null
    this.isAuth = finalConfig.isAuth
    this.port = finalConfig.port
    this.options = config.options || {}
  }

  init () {
    this.wss = new WebSocket.Server({
      port: this.port,
      ...this.options
    })

    // this.heartbeat()
    this.wss.on('connection', ws => {
      ws.isAlive = true
      ws.on('message', msg => this.onMessage(ws, msg))
      ws.on('close', () => this.onClise(ws))
    })
  }

  async onMessage (ws, msg) {
    const msgObj = JSON.stringify(msg)
    const events = {
      auth: async () => {
        const obj = await getJWTPayload(msgObj.messgae)
        if (obj) {
          ws.isAuth = true
          ws._id = obj._id
        } else {
          ws.send(JSON.stringify({
            event: 'noauth',
            messgae: 'Please auth again'
          }))
        }
      },
      heartbeat: () => {
        if (msgObj.messgae === 'pong') {
          ws.isAlive = true
        }
      },
      messgae: () => {
        if (this.isAuth && !ws.isAuth) {
          return
        }

        this.wss.clients.forEach(client => {
          if (client.readyState == WebSocket.OPEN && client._id === ws._id) {
            this.send(msg)
          }
        })
      }
    }
    events[msgObj.event]()
  }

  send (uid, msg) {
    this.wss.clients.forEach(client => {
      if (client.readyState == WebSocket.OPEN && client._id === uid) {
        this.send(msg)
      }
    })
  }

  broadcast (msg) {
    this.wss.clients.forEach(client => {
      if (client.readyState == WebSocket.OPEN) {
        this.send(msg)
      }
    })
  }

  onClose (ws) {
    
  }

  heartbeat () {
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (!ws.isAlive && ws.roomid) {
          delete ws.roomid
          return ws.terminate()
        }

        ws.isAlive = false
        ws.send(JSON.stringify({
          event: 'heartbeat',
          message: 'ping'
        }))
      })
    }, this.timeInterval)
  }
}

export default WebSocketServer