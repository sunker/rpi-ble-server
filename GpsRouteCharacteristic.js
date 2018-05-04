const bleno = require('bleno')
const { TextEncoder } = require('text-encoding')
const mongo = require('./models/mongo.js')
const chunk = require('lodash.chunk')

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

  async delayedNotification (value, delay = 1000) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (this.updateValueCallback) {
          this.updateValueCallback(new TextEncoder().encode(value))
        }
        resolve()
      }, delay);
    })
  }

  async onSubscribe (maxValueSize, updateValueCallback) {
    console.log("GPS route subscribed", maxValueSize)
    this.updateValueCallback = updateValueCallback
    const coordinates = await this.getCoordinates()
    const stringCoordinates = coordinates.map(({ longitude, latitude, timestamp, speed }) => `${longitude};${latitude};${timestamp};${speed}`)
    const chunkedCoordinates = chunk(stringCoordinates, 4)
    for (const chunk of chunkedCoordinates) {
      const string = chunk.join('|')
      console.log(string)
      await this.delayedNotification(string, 100)
    }

  }

  onUnsubscribe () {
    this.updateValueCallback = null
  }

  sendNotification (value) {
    if (this.updateValueCallback) {
      this.updateValueCallback(new TextEncoder().encode(`${longitude};${latitude};${timestamp};${speed}`))
    }
  }
}
