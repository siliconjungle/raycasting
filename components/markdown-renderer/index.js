import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heading } from '@chakra-ui/react'
import { UnorderedList } from '@chakra-ui/react'
import { OrderedList } from '@chakra-ui/react'
import { ListItem } from '@chakra-ui/react'

const H1 = ({ children }) => <Heading as="h1" size="4xl">{children}</Heading>
const H2 = ({ children }) => <Heading as="h2" size="3xl">{children}</Heading>
const H3 = ({ children }) => <Heading as="h3" size="2xl">{children}</Heading>
const H4 = ({ children }) => <Heading as="h4" size="xl">{children}</Heading>
const H5 = ({ children }) => <Heading as="h5" size="lg">{children}</Heading>
const H6 = ({ children }) => <Heading as="h6" size="md">{children}</Heading>

const MarkdownRenderer = ({
  source,
}) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: H1,
        h2: H2,
        h3: H3,
        h4: H4,
        h5: H5,
        h6: H6,
        ol: OrderedList,
        ul: UnorderedList,
        li: ListItem,
      }}
    >
      {source}
    </Markdown>
  )
}

export default MarkdownRenderer
