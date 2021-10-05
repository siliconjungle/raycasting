import React from 'react'
import {
  Button,
  Box,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import AutoResizeTextarea from 'components/auto-resize-text-area'
import RadialIndicator from 'components/radial-indicator'

const CreatePostModal = ({
  finalRef,
  initialRef,
  isOpen,
  text,
  onClose,
  onInputChange,
  onSubmit,
  maxCharacters,
}) => {
  const remainingCharacters = maxCharacters - text.length
  const progress = maxCharacters ? Math.min(text.length / maxCharacters * 100, 100) : 0

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
        <ModalHeader>
          Create Post
        </ModalHeader>
        <ModalCloseButton />
        <Box as="form" onSubmit={onSubmit} w="100%">
          <ModalBody pb={4}>
            <HStack>
              <AutoResizeTextarea
                variant="filled"
                placeholder={'What do you dream of?'}
                value={text}
                ref={initialRef}
                onChange={onInputChange}
                maxCharacters={maxCharacters}
              />
              {maxCharacters && progress !== 0 && (
                <RadialIndicator
                  remainingCharacters={remainingCharacters}
                  progress={progress}
                />
              )}
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              type="submit"
              variant="solid"
              isFullWidth
              disabled={
                progress === 0 ||
                maxCharacters && remainingCharacters < 0
              }
            >
              Post
            </Button>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  )
}

export default CreatePostModal
