import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { VStack, Heading } from '@chakra-ui/react'
import { type, insert, remove } from 'ot-text-unicode'
import { calculateDiff } from 'lib/diff'
import useSubscriptionOT from 'hooks/useSubscriptionOt'
const TextArea = dynamic(() => import('components/text-area'), { ssr: false })
const MarkdownRenderer = dynamic(() => import('components/markdown-renderer'), { ssr: false })

const Posts = () => {
  const { data, initialValue, submitChange } = useSubscriptionOT('document', '')

  const handleTextChange = (e) => {
    if (submitChange) {
      const diff = calculateDiff(data, e.target.value)
      const op = []

      if (diff.del) {
        op.push(remove(diff.pos, diff.del))
      }

      if (diff.ins !== '') {
        op.push(insert(diff.pos, diff.ins))
      }
      submitChange(op.length > 1 ? type.compose(...op) : op[0])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <TextArea value={data || ''} onChange={handleTextChange} />
      <MarkdownRenderer source={data || ''} />
    </div>
  )
}

const Home = () => {
  return (
    <>
      <Head>
        <title>Infinite Dream Machine</title>
        <meta name="description" content="Collaborative editing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <VStack spacing={4}>
          <Heading as="h1">Collaborative editing</Heading>
          <Posts />
        </VStack>
      </main>
    </>
  )
}

export default Home
