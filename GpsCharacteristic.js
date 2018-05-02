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
    gpsdClient.on('coordinate', this.sendNotification.bind(this))
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    console.log("GPS subscribed", updateValueCallback);
    this.updateValueCallback = updateValueCallback;
  }

  onUnsubscribe () {
    console.log("GPS unsubscribed");
    this.previousSpeed = null
    this.updateValueCallback = null;
  }

  sendNotification (value) {
    if (this.updateValueCallback) {
      let { longitude, latitude, timestamp, speed } = value
      speed = speed >= 0.1 ? speed : 0.00
      speed = (speed >= 0.1 && speed <= 0.2) && this.previousSpeed === 0.00 ? 0.00 : speed
      
      if (speed === 0.00 && this.previousSpeed === 0.00) {
        console.log('Ignore emiting GPS coordinate')
      } else {
        console.log('Emiting speed:', speed)
        this.updateValueCallback(new TextEncoder().encode(`${longitude};${latitude};${timestamp};${speed}`));
      }
      this.previousSpeed = speed
    }
  }
}
