import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { VStack, Heading } from '@chakra-ui/react'
import { type, insert, remove } from 'ot-text-unicode'
import { strPosToUni } from 'unicount'
import { calculateDiff } from 'lib/diff'
import useSubscriptionOT from 'hooks/useSubscriptionOt'
const TextArea = dynamic(() => import('components/text-area'), { ssr: false })
const MarkdownRenderer = dynamic(() => import('components/markdown-renderer'), { ssr: false })

const Posts = () => {
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const handlePatch = useCallback(patch => {
    if (!patch.isLocal) {
      const newSelection = type.transformSelection([strPosToUni(data, selectionStart), strPosToUni(data, selectionEnd)], patch.op)
      setSelectionStart(newSelection[0])
      setSelectionEnd(newSelection[1])
    }
  }, [selectionStart, selectionEnd])
  const { data, submitChange } = useSubscriptionOT('document', '', handlePatch)

  const handleTextChange = (e) => {
    setSelectionStart?.(e.target.selectionStart)
    setSelectionEnd?.(e.target.selectionEnd)
    e.target.setSelectionRange(selectionStart, selectionEnd)
    if (submitChange) {
      const diff = calculateDiff(data, e.target.value)
      if (!diff.del && diff.ins === '') {
        return
      }

      const ops = []

      if (diff.del) {
        ops.push(...remove(diff.pos, diff.del))
      }

      if (diff.ins) {
        ops.push(...insert(diff.pos, diff.ins))
      }

      submitChange(ops)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <TextArea value={data} onChange={handleTextChange} selectionStart={selectionStart} selectionEnd={selectionEnd} />
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
