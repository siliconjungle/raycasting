import * as braid from '@braid-protocol/server'
import { type } from 'ot-text-unicode'
import { contentRepository } from 'lib/files'

let doc = contentRepository.get()

const history = []
const clients = new Set()

const broadcastMessage = (op, version, patchId) => {
  for (const c of clients) {
    c.append({
      patchId,
      version: `${history.length}`,
      patches: [
        JSON.stringify(op) + '\n',
      ]
    })
  }
}

const applyPatch = (
  op,
  version,
  patchId,
) => {
  if (version > history.length) throw Error('Invalid version')

  while (version < history.length) {
    const entry = history[version]
    if (patchId != null && patchId === entry.id) return
    op = type.transform(op, entry.op, 'left')
    version++
  }

  doc = type.apply(doc, op)

  history.push({
    id: patchId,
    op,
  })

  contentRepository.upsert(doc)

  broadcastMessage(op, version, patchId)
}

const getDocument = (req, res) => {
  if (req.headers.subscribe === 'keep-alive') {
    if (!clients.length) {
      doc = contentRepository.get()
    }
    const stream = braid.stream(res, {
      reqHeaders: req.headers,
      initialValue: doc,
      initialVerson: `${history.length}`,
      contentType: 'text/plain',
      patchType: type.name,
      onclose() {
        if (stream) clients.delete(stream)
      },
    })
    if (stream) {
      clients.add(stream)
    }
  } else {
    res.end()
  }
}

const putDocument = (req, res) => {
  const patchType = req.headers['patch-type']
  if (patchType !== type.name) {
    return res.end('Missing or unsupported patch type')
  }

  let parents = req.headers['parents']
  if (parents == null || Array.isArray(parents)) {
    return res.end('Missing parents field')
  }
  parents = parents.trim()
  if (parents.startsWith('"')) parents = parents.slice(1, -1)

  const version = parseInt(parents)
  if (isNaN(version)) {
    return res.end('Invalid parents field')
  }

  const op = req.body
  const opId = req.headers['patch-id']

  try {
    applyPatch(JSON.parse(op), version, opId)
  } catch (e) {
    res.end(e.message)
  }

  res.end()
}

const handler = async (req, res) => {
  if (req.method === 'GET') {
    getDocument(req, res)
  } else if (req.method === 'PUT') {
    putDocument(req, res)
  }
}

export default handler
