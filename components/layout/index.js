import React from 'react'
import Header from '../header'
import { Box } from '@chakra-ui/react'

const Layout = ({ user, children }) => {
  return (
    <>
      <Header user={user} />
      <Box pt={4} pb={4}>
        {children}
      </Box>
    </>
  )
}

export default Layout
