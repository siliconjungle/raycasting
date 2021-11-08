import { type } from 'ot-text-unicode'
import makeStream from 'ministreamiterator'
import { subscribeRaw } from '@braid-protocol/client-raw'

const decoder = new TextDecoder()

const transformX = (op1, op2) => [
  type.transform(op1, op2, 'left'),
  type.transform(op2, op1, 'right'),
]

// This needs to be re-written as a hook.
// Rather than making the state mutable, you'll need to make it immutable... is that going to cause issues?
// An alternative to this would be to make it class based... I don't like the sound of that.
export const subscribeOT = async (url) => {
  const stream = makeStream()

  const { streamHeaders, updates } = await subscribeRaw(url)

  // The first value should contain the document itself. For now I'm just
  // hardcoding this - but this should deal correctly with known versions and
  // all that jazz.
  const first = await updates.next()
  if (first.done) throw Error('No messages in stream')

  if (first.value.type !== 'snapshot') throw Error('Expected subscription to start with a snapshot')
  let doc = decoder.decode(first.value.value)
  let serverVersion = first.value.headers['version']

  // Operations waiting to be sent
  let pendingOp = null
  // Operations waiting to be acknowledged
  let inflightOp = null

  const processStream = async () => {
    for await (const data of updates) {
      const id = data.headers['patch-id']

      serverVersion = data.headers['version']

      if (inflightOp != null && id === inflightOp.id) {
        // Operation confirmed!
        inflightOp = null
        flushPending()
      } else {

        if (data.type === 'snapshot') {
          // Snapshot updates replace the contents of the document. Only
          // the first message in the subscription will be a snapshot
          // update here - though we may get them when reconnecting if
          // the server doesn't have context to catch up.

          // I'd implement it by replacing doc with the new value, but
          // we would also need to discard pending / inflight ops and
          // thats tricky.
          throw Error('Snapshot update inside the stream not supported')
        } else {
          // We'll only get one patch per message anyway, but eh.
          for (const { headers, body } of data.patches) {
            const patchType = headers['content-type']
              ?? headers['patch-type']
              ?? streamHeaders['patch-type']
            if (patchType !== type.name) throw Error('unsupported patch type')

            let op = JSON.parse(decoder.decode(body))

            // Transform the incoming operation by any operations queued up to be
            // sent in the client.
            if (inflightOp != null)
              [inflightOp.op, op] = transformX(inflightOp.op, op)
            if (pendingOp != null) [pendingOp, op] = transformX(pendingOp, op)

            doc = type.apply(doc, op)

            stream.append({
              value: doc,
              version: serverVersion,
              op,
              isLocal: false,
            })
          }
        }
      }
    }
  }
  // This method is only called once anyway. I'd do it with ;(async () => {})() but for
  // some reason that confuses the TS typechecker.
  processStream()

  const sendInflight = async () => {
    // Could just ignore - but this should never happen.
    if (inflightOp == null) throw Error('Invalid call to sendInFlight')

    fetch(url, {
      method: 'PUT',
      headers: {
        'patch-id': inflightOp.id,
        'patch-type': type.name,
        'parents': serverVersion,
        'content-type': 'text/plain',
      },
      body: JSON.stringify(inflightOp.op),
    })
  }

  const flushPending = () => {
    // We'll use only a single operation in-flight at once, to keep things a bit
    // simpler.
    if (inflightOp != null || pendingOp == null) return

    // Ok - set the pending operation in flight.
    inflightOp = {
      op: pendingOp,
      id: `${Math.random()}`.slice(2),
    }
    pendingOp = null
    sendInflight()
  }

  const submitChange = (op) => {
    doc = type.apply(doc, op)
    pendingOp = pendingOp ? type.compose(pendingOp, op) : op

    stream.append({
      value: doc,
      version: serverVersion,
      op,
      isLocal: true,
    })

    flushPending()
  }

  return {
    patches: stream.iter,
    submitChange,
    initialValue: doc,
    initialVersion: serverVersion,
  }
}
