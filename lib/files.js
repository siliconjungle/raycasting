import fs from 'fs'

const getData = () => {
  try {
    const data = fs.readFileSync('data/content.json')
    console.log(data)
    return JSON.parse(data)
  } catch (err) {
    console.error(err)
  }
}

const saveData = (data) =>
  new Promise((resolve, reject) => {
    fs.writeFileSync('data/content.json', JSON.stringify(data, null, 2))
    resolve()
  })

const get = () => {
  return getData()?.document
}

const upsert = document => {
  saveData({ document })
}

export const contentRepository = {
  get,
  upsert,
}
