import fs from 'fs'

const getFilepathByRoute = route =>
  route ?
    `data/${route}/content.json` :
    'data/content.json'

const getData = (route) => {
  try {
    const data = fs.readFileSync(getFilepathByRoute(route))
    console.log(data)
    return JSON.parse(data)
  } catch (error) {
    console.error(error)
    return null
  }
}

const saveData = (route, data) =>
  new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(`data/${route}`)) {
        fs.mkdirSync(`data/${route}`, { recursive: true })
      }
      fs.writeFileSync(getFilepathByRoute(route), JSON.stringify(data, null, 2))
      resolve()
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })

const get = route => {
  return getData(route)
}

const upsert = (route, content) => {
  saveData(route, content)
}

export const contentRepository = {
  get,
  upsert,
}
