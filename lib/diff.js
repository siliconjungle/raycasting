export const calculateDiff = (oldValue, newValue) => {
  // Strings are immutable and have reference equality. I think this test is O(1), so its worth doing.
  if (oldValue === newValue) return { pos: 0, del: 0, ins: '' }

  let oldChars = [...oldValue]
  let newChars = [...newValue]

  let commonStart = 0;
  while (oldChars[commonStart] === newChars[commonStart]) {
    commonStart++
  }

  let commonEnd = 0
  while (oldChars[oldChars.length - 1 - commonEnd] === newChars[newChars.length - 1 - commonEnd] &&
  commonEnd + commonStart < oldChars.length && commonEnd + commonStart < newChars.length) {
    commonEnd++
  }

  const del = (oldChars.length !== commonStart + commonEnd)
    ? oldChars.length - commonStart - commonEnd
    : 0
  const ins = (newChars.length !== commonStart + commonEnd)
    ? newChars.slice(commonStart, newChars.length - commonEnd).join('')
    : ''

  return {
    pos: commonStart,
    del,
    ins,
  }
}
