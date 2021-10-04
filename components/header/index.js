import React from 'react'
import {
  Box,
  HStack,
  Spacer,
} from '@chakra-ui/react'
import Link from 'next/link'

const Header = () => {
  return (
    <HStack spacing={4} p={4} borderWidth="0 0 1px 0" sx={{ display: 'flex', width: '100%' }}>
      <Box>
        <Link href="/">
          Infinite Dream Machine
        </Link>
      </Box>
      <Spacer sx={{ flex: 1 }} />
      <Box>
        {/* Add about page etc */}
      </Box>
    </HStack>
  )
}

export default Header
