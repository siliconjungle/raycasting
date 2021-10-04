import React from 'react'
import {
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import AutoResizeTextarea from 'components/auto-resize-text-area'

const CreatePostModal = ({
  finalRef,
  initialRef,
  isOpen,
  text,
  onClose,
  onInputChange,
  onSubmit,
}) => {
  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Post</ModalHeader>
        <ModalCloseButton />
        <Box as="form" onSubmit={onSubmit} w="100%">
          <ModalBody pb={4}>
            <AutoResizeTextarea
              variant="filled"
              placeholder={'What do you dream of?'}
              value={text}
              ref={initialRef}
              onChange={onInputChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" type="submit" variant="solid" isFullWidth disabled={text === ''}>
              Post
            </Button>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  )
}

export default CreatePostModal
