const mongo = require('./models/mongo.js')
const { getDistance } = require('geolib')

module.exports = (gpsdClient) => {
  let coordinates = []
  let previousCoordinate = null
  gpsdClient.on('coordinate', coord => coordinates.push(coord))

  setInterval(function () {
    if (coordinates.length > 0) {
      console.log('Add coordnates. Length: ', coordinates.length)
      const doc = coordinates[coordinates.length - 1]
      doc.speed = (coordinates.map(x => Number(x.speed || 0)).reduce((total, obj) => {
        total = total + obj
        return total
      }, 0) / coordinates.length).toFixed(2)
      const { latitude, longitude } = doc
      doc.distance = previousCoordinate ? getDistance(previousCoordinate, { latitude, longitude }, 1, 3).toFixed(4) : 0
      console.log('Distance: ', doc.distance)
      // console.log('previousCoordinate.totalDistance ', previousCoordinate.totalDistance )
      doc.totalDistance = previousCoordinate && previousCoordinate.totalDistance ? (Number(previousCoordinate.totalDistance) + Number(doc.distance)) : Number(doc.distance)
      console.log('Total distance: ', doc.totalDistance)
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

      previousCoordinate = doc
      console.log('previousCoordinate.totalDistance ', previousCoordinate.totalDistance )
      coordinates = []
    }
  }, 6000)
}