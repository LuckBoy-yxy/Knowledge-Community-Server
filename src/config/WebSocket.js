import WebSocket from 'ws'
import { getJWTPayload } from '../common/utils'
import CommentsModel from '../model/Comments'

class WebSocketServer {
  constructor (config = {}) {
    const defaultConfig = {
      port: 3012,
      timeInterval: 1000,
      isAuth: true
    }
    const finalConfig = { ...defaultConfig, ...config }
    this.wss = {}
    this.timeInterval = finalConfig.timeInterval
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

    this.wss.on('connection', ws => {
      ws.isAlive = true
      ws.on('message', msg => this.onMessage(ws, msg))
      ws.on('close', () => this.onClose(ws))
    })
    this.heartbeat()
  }

  async onMessage (ws, msg) {
    const msgObj = JSON.parse(msg)
    const events = {
      auth: async () => {
        try {
          const obj = await getJWTPayload(msgObj.message)
          if (obj) {
            ws.isAuth = true
            ws._id = obj._id
            const num = await CommentsModel.msgCount(obj._id)
            ws.send(JSON.stringify({
              event: 'message',
              message: num
            }))
          }
        } catch (err) {
          ws.send(JSON.stringify({
            event: 'noauth',
            messgae: 'Please auth again'
          }))
        }
      },
      heartbeat: () => {
        console.log(msgObj)
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
        client.send(msg)
      }
    })
  }

  broadcast (msg) {
    this.wss.clients.forEach(client => {
      if (client.readyState == WebSocket.OPEN) {
        client.send(msg)
      }
    })
  }

  onClose (ws) {
    
  }

  heartbeat () {
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (!ws.isAlive) {
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