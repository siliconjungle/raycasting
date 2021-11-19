let textureList = {}

const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image()
  img.addEventListener('load', () => resolve(img))
  img.addEventListener('error', (err) => reject(err))
  img.src = url
})

// This should be converted to a promise.all for efficiency reasons.
export const loadTextures = async (textures) => {
  for (const { key, filepath } of textures) {
    const img = await loadImage(filepath)
    textureList[key] = { filepath, img }
  }
  return textureList
}

export const getTextureImagesByKeys = keys => {
  return keys.map(key => {
    return textureList[key].img
  })
}
