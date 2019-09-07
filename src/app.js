import BootBot from 'bootbot'

import config from './config'
import EduPage from './models/edupage'

const bot = new BootBot({
  accessToken: config.accessToken,
  verifyToken: config.verifyToken,
  appSecret: config.appSecret
})

const giganci = new EduPage({
  address: 'zsp1wagrowiec'
})

const classRegex = /^([\d\w]{2,5})$/

bot.start()

bot.hear(classRegex, async (payload, chat) => {
  const clas = payload.message.text

  const tt = giganci.getTimeTable()[clas]

  if (!tt) {
    chat.say('Nie znaleziono klasy')
    return
  }

  // Dni
  for (const [i, day] of tt.entries()) {
    let message = `Dzień ${i + 1}\n`

    if (day.length === 0) {
      message += 'WOLNE'
      continue
    }

    // Godziny lekcyjne
    day.forEach((lessons, ii) => {
      message += `Lekcja ${ii + 1}\n`

      // Lekcje
      for (const { classroom, subject} of lessons) {
        message += `${classroom} - ${subject}\n`
      }

      message += '\n'
    })

    await chat.say(message)
  }
})
