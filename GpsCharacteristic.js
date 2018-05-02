const bleno = require('bleno');
const gpsd = require('node-gpsd');
const Bancroft = require('bancroft');
const { TextEncoder } = require('text-encoding');

module.exports = class GpsCharacteristic extends bleno.Characteristic {
  constructor(gpsdClient, uuid) {
    super({
      uuid,
      properties: ["notify"],
      value: null
    })
    this.previousSpeed = null
    gpsdClient.on('coordinate', this.sendNotification)
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    this.updateValueCallback = updateValueCallback;
  }

  onUnsubscribe () {
    console.log("GPS unsubscribed");
    this.updateValueCallback = null;
  }

  sendNotification (value) {
    console.log('coordinate', value)

    if (this.updateValueCallback) {
      let { longitude, latitude, timestamp, speed } = value
      speed = speed >= 0.1 ? speed : 0.00

      if (speed === 0.00 && this.previousSpeed === 0.00) {
        console.log('Ignore emiting GPS coordinate')
      } else {
        console.log('speed', speed)
        this.updateValueCallback(new TextEncoder().encode(`${longitude};${latitude};${timestamp};${speed}`));
      }
      this.previousSpeed = speed
    }
  }
}
