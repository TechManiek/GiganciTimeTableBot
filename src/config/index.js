import fs from 'fs'

if(!fs.existsSync(__dirname + '/config.json')) {
  throw new Error('Zastosuj sie do instrukcji https://github.com/TechManiek/GiganciTimeTableBot/#konfiguracja')
}

export const isDev = process.env.NODE_ENV == 'development'

export default require('./config.json')