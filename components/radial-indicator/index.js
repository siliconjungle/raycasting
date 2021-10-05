import React from 'react'
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react'

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

const RadialIndicator = ({
  remainingCharacters,
  progress,
}) => {
  return (
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
  )
}

export default RadialIndicator
