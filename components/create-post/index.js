import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Input,
  useDisclosure,
} from '@chakra-ui/react'
import CreatePostModal from 'components/create-post-modal'

const CreatePost = ({ addPost }) => {
  const [text, setText] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const initialRef = React.useRef()
  const finalRef = React.useRef()

  const handleInputChange = (event) => {
    event.preventDefault()
    setText(event.target.value)
  }

  const handleSubmitInitialForm = () => {
    event.preventDefault()
    if (!isOpen) {
      onOpen()
    }
  }

  const handleSubmit = () => {
    event.preventDefault()
    if (text) {
      addPost(text)
      onClose()
      setText('')
    }
  }

  return (
    <Box
      as="form"
      maxW="xl"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      w="100%"
      p={4}
      onSubmit={handleSubmitInitialForm}
      ref={finalRef}
    >
      <VStack align="stretch" spacing={4}>
        <HStack sx={{ display: 'flex' }}>
          <HStack align="stretch" sx={{ width: '100%' }}>
            <Input
              variant="filled"
              placeholder={'What do you dream of?'}
              value={text}
              onClick={onOpen}
              onChange={() => {}}
            />
            <CreatePostModal
              initialRef={initialRef}
              finalRef={finalRef}
              text={text}
              isOpen={isOpen}
              onClose={onClose}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}

export default CreatePost
