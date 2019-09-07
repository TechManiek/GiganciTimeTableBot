import axios from 'axios'

const regex = /startTTOnline[\w\W]+?,([\w\W]+?)\);/

export default class EduPage {
  constructor ({
    address
  }) {
    this.address = address

    this.reloadData()
  }

  getTimeTable() {
    return this.__timeTable
  }

  async reloadData() {
    const {
      cards,
      classes,
      classrooms,
      lessons,
      subjects
    } = await this.__downloadData()

    this.__generateTimeTable({
      cards,
      classes,
      classrooms,
      lessons,
      subjects
    })
  }

  /**
   * Generuje obiekt reprezentujacy plan lekci
   */
  __generateTimeTable({ cards, classes, classrooms, lessons, subjects }) {
    // Generowanie struktury planu
    const tt = Object.values(classes).reduce((obj, { name }) => ({
      ...obj,
      [name.toLowerCase()]: new Array(5).fill(0).map(() => new Array())
    }), {})

    // Wypełnienie lekcjami planu
    for (const { days, classroomids, lessonid, period } of cards) {
      const lesson = lessons[lessonid]

      const classs = lesson.classids.map(id => classes[id].name.toLowerCase())
      const classroom = classrooms[classroomids[0]].name
      const day = days.indexOf('1')
      const duration = lesson.durationperiods
      const subject = subjects[lesson.subjectid].name

      // Lekcja miedzy klasowa
      for (const clas of classs) {
        // Lecja kilku godzina
        for (let i = 0; i < duration; i++) {
          const hour = period - 1 + i

          // Obsługa kilku lekcji w jednej godzinie
          if(!tt[clas][day][hour])
            tt[clas][day][hour] = []

          // Informacja o lekcji
          tt[clas][day][hour].push({
            classroom,
            subject
          })
        }
      }
    }

    this.__timeTable = tt
  }

  /**
   * Pobiera dane z strony i przetwarza na obiekt
   */
  __downloadData() {
    return axios.get(`http://${this.address}.edupage.org/timetable/`)
      .then(res => regex.exec(res.data))
      .then(data => JSON.parse(data[1]))
      .then(data => data.changes.reduce((obj, { table, rows }) => ({
        ...obj,
        [table]: (
          table == 'classes' ||
          table == 'classrooms' ||
          table == 'lessons' ||
          table == 'subjects'
        )? arr2obj(rows): rows
      })))
  }
}

/**
 * Zmienia tablice na obiekt
 */
function arr2obj (arr) {
  return arr.reduce((obj, el) => ({
    ...obj,
    [el.id]: el
  }), {})
}
