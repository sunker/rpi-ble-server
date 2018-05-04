const bleno = require('bleno')
const { TextEncoder } = require('text-encoding')
const mongo = require('./models/mongo.js')

module.exports = class GpsRouteCharacteristic extends bleno.Characteristic {
  constructor(uuid) {
    super({
      uuid,
      properties: ["notify"],
      value: null
    })
  }


  async getCoordinates () {
    return new Promise((resolve, reject) => {
      mongo.coordinates.find({}).toArray(function (err, docs) {
        if (!err) {
          console.log("Found the following records");
          resolve(docs)
        } else {
          reject(err)
        }
      });
    })
  }

  async delayedNotification (coord, delay = 1000) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.sendNotification(coord)
        resolve()
      }, delay);
    })
  }

  async onSubscribe (maxValueSize, updateValueCallback) {
    console.log("GPS route subscribed", maxValueSize)
    this.updateValueCallback = updateValueCallback
    const coordinates = await this.getCoordinates()
    for (const coord of coordinates) {
      await this.delayedNotification(coord, 100)
    }

  }

  onUnsubscribe () {
    this.updateValueCallback = null
  }

  sendNotification (value) {
    if (this.updateValueCallback) {
      let { longitude, latitude, timestamp, speed } = value
      this.updateValueCallback(new TextEncoder().encode(`${longitude};${latitude};${timestamp};${speed}`))
    }
  }
}
