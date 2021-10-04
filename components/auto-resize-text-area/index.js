import React, { forwardRef } from 'react'
import { Textarea } from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

// We should upgrade ResizeTextArea with Draft JS in the future.
// Currently we are unable to apply multiple styles to the text.
const AutoResizeTextarea = forwardRef(({ maxCharacters = 280, ...props }, ref) => {
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
      {...props}
    />
  )
})

AutoResizeTextarea.displayName = 'AutoResizeTextarea'

export default AutoResizeTextarea
