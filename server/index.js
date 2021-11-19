import WebSocket, { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

const players = {}

const MESSAGE_TYPES = {
  UPDATE_PLAYERS: 'update-players',
}

const createPlayer = id => {
  players[id] = {
    x: 22,
    y: 12,
    texNum: 1,
  }
}

const getPlayer = id => {
  const player = players[id]
  return {
    id,
    ...player,
  }
}

const getPlayers = () => {
  return Object.keys(players).map(id => {
    return getPlayer(id)
  })
}

const getOtherPlayers = playerId => {
  return getPlayers().filter(player => player.id !== playerId)
}

const movePlayer = (id, x, y) => {
  players[id].x = x
  players[id].y = y
}

const removePlayer = id => {
  delete players[id]
}

const broadcastMessage = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

const broadcastPlayerPositions = () => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: MESSAGE_TYPES.UPDATE_PLAYERS, players: getOtherPlayers(client.id) }))
    }
  })
}

// const sendConnectionMessage = client => {
//   if (client.readyState === WebSocket.OPEN) {
//     client.send(JSON.stringify({ type: MESSAGE_TYPES.UPDATE_PLAYERS, playerId: client.id, players }))
//   }
// }

wss.getUniqueID = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  }
  return s4() + s4() + '-' + s4();
}

wss.on('connection', (ws) => {
  ws.id = wss.getUniqueID()
  createPlayer(ws.id)

  ws.on('message', (data) => {
    const message = JSON.parse(data)
    // console.log('received: %s', data)
    // broadcastMessage
    if (message.type === 'position') {
      movePlayer(ws.id, message.x, message.y)
      broadcastPlayerPositions()
    }
  })

  ws.on('close', () => {
    // Remove player from list & broadcast player positions.
    removePlayer(ws.id)
    broadcastPlayerPositions()
    console.log('disconnected')
  })

  // sendConnectionMessage(ws)

  broadcastPlayerPositions()
})
