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

  onSubscribe (maxValueSize, updateValueCallback) {
    console.log("GPS subscribed", maxValueSize)
    this.updateValueCallback = updateValueCallback
    setInterval(function () {
      updateValueCallback(new TextEncoder().encode(`rööv`))
    }, 200)
    // mongo.coordinates.find({}).toArray(function (err, docs) {
    //   if (!err) {
    //     console.log("Found the following records");
    //     console.log(docs)
    //   }
    // });
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
