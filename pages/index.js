import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { VStack, Heading } from '@chakra-ui/react'
import axios from 'axios'
import { subscribe } from '@braid-protocol/client'
import { autoId } from 'lib/crypto'
import CreatePost from 'components/create-post'
// import AutoResizeTextAreaDraftJs from 'components/auto-resize-text-area-draftjs'
import Post from 'components/post'
// import Card from 'components/card'

const useSubscription = (route, defaultValue) => {
  const [data, setData] = useState(defaultValue)

  useEffect(() => {
    subscribe(`http://localhost:3000/api/${route}`)
      .then(async ({ initialValue, updates }) => {
        setData(JSON.parse(initialValue))
        for await (const { value } of updates) {
          setData(JSON.parse(value))
        }
      })
      .catch(error => {
        console.log('_ERROR_', error)
      })
  }, [route])
  return data
}

const addPost = async (text) => {
  const uid = autoId()
  try {
    await axios.post(`/api/posts`, {
      id: uid,
      text: text,
    })
  } catch(error) {
    console.log('_ERROR_', error)
  }
}

const Home = () => {
  const cards = useSubscription('posts', [])
  const handleAddPost = async (text) => {
    await addPost(text)
  }

  return (
    <>
      <Head>
        <title>Infinite Dream Machine</title>
        <meta name="description" content="Explore dreams and aspirations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <VStack spacing={4}>
          <Heading as="h1">Dreams and aspirations</Heading>
          {/*<Card p={4}>*/}
            {/*<AutoResizeTextAreaDraftJs />*/}
          {/*</Card>*/}
          <CreatePost addPost={handleAddPost} />
          {cards.map(({ id, text, date }) => (
            <Post key={id} id={id} text={text} date={date} />
          ))}
        </VStack>
      </main>
    </>
  )
}

export default Home
