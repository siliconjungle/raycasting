import React, { useRef, useEffect } from 'react'
import { Textarea } from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

const TextArea = ({
  value,
  onChange,
  selectionStart,
  selectionEnd,
}) => {
  const ref = useRef(null)

  useEffect(() => {
    const input = ref.current
    if (input) {
      input.setSelectionRange(selectionStart, selectionEnd)
    }
  }, [ref, selectionStart, selectionEnd, value])

  const handleChange = (e) => {
    onChange?.(e)
  }

  return (
    <Textarea
      minH="unset"
      overflowY="auto"
      w="100%"
      resize="none"
      ref={ref}
      minRows={1}
      maxRows={10}
      as={ResizeTextarea}
      placeholder="Start editing the document"
      value={value}
      onChange={handleChange}
    />
  )
}

TextArea.displayName = 'TextArea'

export default TextArea
