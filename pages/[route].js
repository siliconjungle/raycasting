import React, {useState, useCallback, useEffect} from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { VStack, Heading } from '@chakra-ui/react'
import { type, insert, remove } from 'ot-text-unicode'
import { strPosToUni } from 'unicount'
import { calculateDiff } from 'lib/diff'
import useSubscriptionOT from 'hooks/useSubscriptionOt'
import { getTextureImagesByKeys, loadTextures } from 'lib/textures'
const Canvas = dynamic(() => import('components/canvas'), { ssr: false })
const CanvasEditor = dynamic(() => import('components/canvas-editor'), { ssr: false })

const texturesData = [
  { key: 'character-male', filepath: './character.png' },
  { key: 'character-female', filepath: './character2.png' },
  { key: 'pillar', filepath: './pillar-full.png' },
  { key: 'plant', filepath: './plant.png' },
  { key: 'robot', filepath: './robot.png' },
  { key: 'player', filepath: './player.png' },
  { key: 'james', filepath: './james.png' },
  { key: 'floor', filepath: './floor.png' },
  { key: 'floor2', filepath: './floor2.png' },
  { key: 'floor3', filepath: './floor3.png' },
  { key: 'floor4', filepath: './floor4.png' },
  { key: 'floor-snow', filepath: './snow.png' },
  { key: 'floor-lava', filepath: './lava.png' },
  { key: 'wall-skull', filepath: './skull.png' },
  { key: 'wall-skull2', filepath: './skull2.png' },
  { key: 'wall-skull3', filepath: './skull3.png' },
  { key: 'wall', filepath: './wall.png' },
  { key: 'wall2', filepath: './wall2.png' },
  { key: 'wall3', filepath: './wall3.png' },
  { key: 'wall4', filepath: './wall4.png' },
  { key: 'wall5', filepath: './wall5.png' },
  { key: 'wall6', filepath: './wall6.png' },
  { key: 'wall7', filepath: './wall7.png' },
  { key: 'wall8', filepath: './wall8.png' },
  { key: 'pillar-broken', filepath: './pillar-broken.png' },
  { key: 'pillar-broken2', filepath: './pillar-broken2.png' },
  { key: 'floor-water', filepath: './water.png' },
  { key: 'wall-green', filepath: './wall-green.png' },
  { key: 'wall-green2', filepath: './wall-green2.png' },
  { key: 'wall-green3', filepath: './wall-green3.png' },
  { key: 'wall-green4', filepath: './wall-green4.png' },
  { key: 'wall-green5', filepath: './wall-green5.png' },
  { key: 'wall-green6', filepath: './wall-green6.png' },
  { key: 'wall-green7', filepath: './wall-green7.png' },
  { key: 'wall-green8', filepath: './wall-green8.png' },
  { key: 'wall-green9', filepath: './wall-green9.png' },
]

const floorNames = [
  'floor',
  'floor2',
  'floor3',
  'floor4',
  'floor-snow',
  'floor-lava',
  'floor-water',
]

const wallNames = [
  'wall',
  'wall2',
  'wall3',
  'wall4',
  'wall5',
  'wall6',
  'wall7',
  'wall8',
  'wall-skull',
  'wall-skull2',
  'wall-skull3',
  'wall-green',
  'wall-green2',
  'wall-green3',
  'wall-green4',
  'wall-green5',
  'wall-green6',
  'wall-green7',
  'wall-green8',
  'wall-green9',
]

const spriteNames = [
  'pillar',
  'character-male',
  'character-female',
  'james',
  'pillar-broken',
  'pillar-broken2',
]

const Posts = ({ route }) => {
  // const [value, setValue] = useState(new Array(24 * 24 + 1).join('0'))
  const [loading, setLoading] = useState(true)
  const [floors, setFloors] = useState([])
  const [walls, setWalls] = useState([])
  const [sprites, setSprites] = useState([])
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  // This needs to be reworked, it is dependent on data which is dependent on handle patch.
  const handlePatch = useCallback(patch => {
    if (!patch.isLocal) {
      const newSelection = type.transformSelection([strPosToUni(data, selectionStart), strPosToUni(data, selectionEnd)], patch.op)
      setSelectionStart(newSelection[0])
      setSelectionEnd(newSelection[1])
    }
  }, [selectionStart, selectionEnd])
  const { data, submitChange } = useSubscriptionOT(route, '', handlePatch)

  const handleTileChange = elements => {
    if (submitChange) {
      const diff = calculateDiff(JSON.stringify(data) || '', elements)
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

  const loadGameTextures = async () => {
    await loadTextures(texturesData)
    setFloors(getTextureImagesByKeys(floorNames))
    setWalls(getTextureImagesByKeys(wallNames))
    setSprites(getTextureImagesByKeys(spriteNames))
    setLoading(false)
  }

  useEffect(() => {
    loadGameTextures()
  }, [])

  return (
    <VStack spacing={2} align="flex-start">
      {loading ? (
        <div>
          Loading...
        </div>
      ) : (
        <>
          <CanvasEditor floors={floors} walls={walls} sprites={sprites} worldMap={data ? JSON.parse(data) : undefined} onTileChange={handleTileChange} />
          {/*<Canvas floors={floors} walls={walls} sprites={sprites} floorMap={data ? JSON.parse(data) : undefined} />*/}
        </>
      )}
    </VStack>
  )
}

const Home = () => {
  const router = useRouter()
  const { route } = router.query

  console.log('_DOES_THIS_WORK?_', route)

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
          <Posts route={route} />
        </VStack>
      </main>
    </>
  )
}

export default Home
