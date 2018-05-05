const mongo = require('./models/mongo.js')
const { getDistance } = require('geolib')

module.exports = (gpsdClient) => {
  let coordinates = []
  let previousCoordinate = null
  gpsdClient.on('coordinate', (coord) => coordinates.push(coord))

  setInterval(function () {
    if (coordinates.length > 0) {
      console.log('Add coordnates. Length: ', coordinates.length)
      const doc = coordinates[0]
      doc.speed = (coordinates.map(x => Number(x.speed || 0)).reduce((total, obj) => {
        total = total + obj
        return total
      }, 0) / coordinates.length).toFixed(2)


      doc.distance = previousCoordinate ? (coordinates.reduce((total, { latitude, longitude }) => {
        const distance = getDistance(previousCoordinate, { latitude, longitude }, 1, 3)
        console.log('distance', distance)
        total += distance
        console.log('total', total)
        previousCoordinate = { latitude, longitude }
        return total
      }, 0)).toFixed(4) : 0
      console.log('Total distance: ', doc.distance)
      // if (doc.speed > 0.1) {
      const d = new Date()
      doc.createdAt = d.getTime()
      doc.expiresAt = Date.now() + (1000 * 86400 * 3)
      if (mongo.coordinates) {
        mongo.coordinates.insert(doc, function (err) {
          if (err) console.log('error at mongo insert telemetry', err)
          else console.log('Stored in db. Speed', doc.speed)
        })
      }
      // }

      previousCoordinate = coordinates.pop()
      coordinates = []
    }
  }, 6000)
}