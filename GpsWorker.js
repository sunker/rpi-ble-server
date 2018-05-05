const mongo = require('./models/mongo.js')
const { getDistance } = require('geolib')

function distance (lat1, lon1, lat2, lon2, unit = 'N') {
  var radlat1 = Math.PI * lat1 / 180
  var radlat2 = Math.PI * lat2 / 180
  var theta = lon1 - lon2
  var radtheta = Math.PI * theta / 180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515
  if (unit == "K") { dist = dist * 1.609344 }
  if (unit == "N") { dist = dist * 0.8684 }
  return dist
}

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
      console.log('Distance2: ', distance(previousCoordinate, { latitude, longitude }))
      // console.log('previousCoordinate.totalDistance ', previousCoordinate.totalDistance )
      doc.totalDistance = previousCoordinate && previousCoordinate.totalDistance ? (Number(previousCoordinate.totalDistance) + Number(doc.distance)) : Number(doc.distance)
      console.log('Total distance: ', doc.totalDistance)
      // console.log('Total distance2: ', previousCoordinate && previousCoordinate.totalDistance ? (Number(previousCoordinate.totalDistance) + Number(doc.distance)) : Number(doc.distance))
      // if (doc.speed > 0.1) {
      const d = new Date()
      doc.createdAt = d.getTime()
      doc.expiresAt = Date.now() + (1000 * 86400 * 3)
      if (mongo.coordinates) {
        mongo.coordinates.insert(doc, function (err) {
          if (err) console.log('error at mongo insert telemetry', err)
          else console.log('Stored in db. Speed', doc.speed)
        })
        previousCoordinate = doc
        console.log('previousCoordinate.totalDistance ', previousCoordinate.totalDistance)
      }
      // }

      coordinates = []
    }
  }, 6000)
}