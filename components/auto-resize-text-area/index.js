import React, { forwardRef } from 'react'
import { Textarea } from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

const AutoResizeTextarea = forwardRef((props, ref) => {
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
