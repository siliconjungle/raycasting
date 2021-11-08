import * as braid from '@braid-protocol/server'
import { type } from 'ot-text-unicode'

let doc = ''

const history = []
const clients = new Set()

const broadcastMessage = (op, version, patchId) => {
  for (const c of clients) {
    c.append({
      patchId,
      version: `${version}`,
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

  console.log('_VALID_VERSION_')
  console.log('_OP_', op)
  // while (version < history.length) {
  //   const entry = history[version]
  //   if (patchId != null && patchId === entry.id) return
  //     console.log('_INNER_OP_', op)
  //     console.log('_INNER_ENTRY_OP_', entry.op)
  //     op = type.transform(op, entry.op, 'left')
  //     console.log('_POST_INNER_OP_', op)
  //   version++
  // }

  console.log('_PRE_TYPE_APPLY_', doc, op)

  doc = type.apply(doc, op)
  console.log('_DOC_', doc)
  history.push({
    id: patchId,
    op,
  })
  console.log('_HISTORY_PASSED_', history)

  broadcastMessage(op, version, patchId)
}

const getDocument = (req, res) => {
  if (req.headers.subscribe === 'keep-alive') {
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
    if (stream) clients.add(stream)
  } else {
    res.end()
  }
}

const putDocument = (req, res) => {
  const patchType = req.headers['patch-type']
  if (patchType !== type.name) {
    console.log('_UNSUPPORTED_')
    return res.end('Missing or unsupported patch type')
  }

  let parents = req.headers['parents']
  if (parents == null || Array.isArray(parents)) {
    console.log('_MISSING_PARENTS_')
    return res.end('Missing parents field')
  }
  parents = parents.trim()
  if (parents.startsWith('"')) parents = parents.slice(1, -1)

  const version = parseInt(parents)
  if (isNaN(version)) {
    console.log('_IS_NAN_')
    return res.end('Invalid parents field')
  }

  const op = req.body
  const opId = req.headers['patch-id']

  console.log('Received operation', op, 'id:', opId)

  try {
    applyPatch(JSON.parse(op), version, opId)
  } catch (e) {
    console.log('_ERROR_', e)
    res.end(e.message)
  }

  // The version header will be ignored. We don't care.
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
