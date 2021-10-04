import { randomBytes } from 'crypto'

export const autoId = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let autoId = ''
  while (autoId.length < 20) {
    const bytes = randomBytes(40)
    bytes.forEach(b => {
      // Length of `chars` is 62. We only take bytes between 0 and 62*4-1
      // (both inclusive). The value is then evenly mapped to indices of `char`
      // via a modulo operation.
      const maxValue = 62 * 4 - 1
      if (autoId.length < 20 && b <= maxValue) {
        autoId += chars.charAt(b % 62)
      }
    })
  }
  return autoId
}
