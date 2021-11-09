import { contentRepository } from './files'
import * as braid from '@braid-protocol/server'
import { type } from 'ot-text-unicode'

const routes = {}

const getRouteData = route => {
  return routes?.[route] || null
}

const createRoute = route => {
  const content = contentRepository.get(route)
  const doc = content?.doc || ''
  const history = content?.history || []

  routes[route] = {
    doc,
    history,
    clients: new Set(),
  }

  return routes[route]
}

const deleteRoute = route => {
  delete routes?.[route]
}

const connectToRoute = (req, res, route) => {
  const routeData = getRouteData(route) || createRoute(route)
  const { doc, history } = routeData

  const stream = braid.stream(res, {
    reqHeaders: req.headers,
    initialValue: doc,
    initialVerson: `${history.length}`,
    contentType: 'text/plain',
    patchType: type.name,
    onclose() {
      if (stream) {
        const clients = getRouteData(route)?.clients || []
        clients.delete(stream)
        if (clients.length === 0) {
          deleteRoute(route)
        }
      }
    },
  })
  if (stream) {
    routeData.clients.add(stream)
  }
}

// Should empty documents get deleted?
export const routesRepository = {
  getRouteData,
  connectToRoute,
}
