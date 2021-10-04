import React from 'react'
import { Box } from '@chakra-ui/react'

const Card = ({ p = 0, children }) => {
  return (
    <Box
      maxW="xl"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={p}
      w="100%"
    >
      {children}
    </Box>
  )
}

export default Card
