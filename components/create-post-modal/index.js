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
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react'
import AutoResizeTextarea from 'components/auto-resize-text-area'

const getRadiusSize = remainingCharacters => remainingCharacters > 20 ? '1.25em' : '1.5em'

const getRadiusVisibility = remainingCharacters => remainingCharacters <= -10 ? 'hidden' : 'inherit'

const getTextVisibility = remainingCharacters => remainingCharacters > 20 ? 'hidden' : 'visible'

const getTextColor = remainingCharacters => remainingCharacters > 0 ? 'inherit' : 'red.400'

const getRadiusColor = remainingCharacters => {
  if (remainingCharacters > 20) {
    return 'teal.400'
  } else if (remainingCharacters > 0) {
    return 'yellow.400'
  }
  return 'red.400'
}

const CreatePostModal = ({
  finalRef,
  initialRef,
  isOpen,
  text,
  onClose,
  onInputChange,
  onSubmit,
  maxCharacters = 280,
}) => {
  const remainingCharacters = maxCharacters - text.length
  const progress = Math.min(text.length / maxCharacters * 100, 100)
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
              {text !== '' && (
                <Box>
                  <CircularProgress
                    value={progress}
                    color={getRadiusColor(remainingCharacters)}
                    size={getRadiusSize(remainingCharacters)}
                    thickness="8px"
                    sx={{ visibility: getRadiusVisibility(remainingCharacters) }}
                  >
                    <CircularProgressLabel
                      fontSize="sm"
                      color={getTextColor(remainingCharacters)}
                      sx={{
                        visibility: getTextVisibility(remainingCharacters)
                      }}
                    >
                      {remainingCharacters}
                    </CircularProgressLabel>
                  </CircularProgress>
                </Box>
              )}
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              type="submit"
              variant="solid"
              isFullWidth
              disabled={text === '' || remainingCharacters < 0}
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
