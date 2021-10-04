import React from 'react'
import {
  Text,
  VStack,
} from '@chakra-ui/react'
import Card from 'components/card'

const Post = ({
  id,
  text,
  date,
}) => {
  return (
    <Card p={4}>
      <VStack align="stretch" spacing={4}>
        <Text>{text}</Text>
      </VStack>
    </Card>
  )
}

export default Post
