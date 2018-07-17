const EventEmitter = require('events').EventEmitter
const mongo = require('./models/mongo.js')

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

module.exports = class GpsdWorker extends EventEmitter {
  constructor(gpsdClient) {
    super()
    this.coordinates = []
    this.previousCoordinate = null
    gpsdClient.on('coordinate', coord => this.coordinates.push(coord))

    setInterval(() => {
      this.aggregate()
    }, 2000)
  }

  getAverageSpeed () {
    return (this.coordinates.map(x => Number(x.speed || 0)).reduce((total, obj) => {
      total = total + obj
      return total
    }, 0) / this.coordinates.length).toFixed(2)
  }

  storeCoordinate (doc) {
    const d = new Date()
    doc.createdAt = d.getTime()
    doc.expiresAt = Date.now() + (1000 * 86400 * 3)
    if (mongo.coordinates) {
      mongo.coordinates.insert(doc, function (err) {
        if (err) console.log('error at mongo insert telemetry', err)
        else console.log('Stored in db. Speed', doc.speed)
      })
    }
  }

  aggregate () {
    try {
      if (this.coordinates.length > 0) {
        const doc = this.coordinates[this.coordinates.length - 1]
        doc.speed = this.getAverageSpeed()
        const { latitude, longitude } = doc
        doc.distance = this.previousCoordinate ? distance(this.previousCoordinate.latitude, this.previousCoordinate.longitude, latitude, longitude).toFixed(8) : 0
        console.log('doc.distance', doc.distance)
        console.log('this.previousCoordinate', this.previousCoordinate)
        console.log('this.previousCoordinate.totalDistance', this.previousCoordinate ? this.previousCoordinate.totalDistance : 'röv')
        doc.totalDistance = (this.previousCoordinate && this.previousCoordinate.totalDistance ? (Number(this.previousCoordinate.totalDistance) + Number(doc.distance)) : Number(doc.distance)).toFixed(6)
        console.log('Total distance: ', doc.totalDistance)
        // if (doc.speed > 0.1) {
        this.storeCoordinate(doc)
        this.emit('totalDistance', doc.totalDistance)
        // }
        this.previousCoordinate = doc
        this.coordinates = []
      }
    } catch (error) {
      console.log('error', error)
    }
  }
}