const bleno = require('bleno');
const gpsd = require('node-gpsd');
const Bancroft = require('bancroft');
const { TextEncoder } = require('text-encoding');

module.exports = class GpsCharacteristic extends bleno.Characteristic {
  constructor(uuid) {
    super({
      uuid,
      properties: ["notify"],
      value: null
    });

    this.counter = 0;
  }

  onSubscribe (maxValueSize, updateValueCallback) {
    this.updateValueCallback = updateValueCallback;
  }

  onUnsubscribe () {
    console.log("GPS unsubscribed");
    this.updateValueCallback = null;
  }

  sendNotification (value) {

    if (this.updateValueCallback) {
      let { longitude, latitude, timestamp, speed } = value
      speed = (speed * 1.943844492).toFixed(2)
      console.log('speed', speed)
      this.updateValueCallback(new TextEncoder().encode(`${longitude.toFixed(5)};${latitude.toFixed(5)};${timestamp};${speed}`));
    }
  }

  start () {
    const daemon = new gpsd.Daemon({
      program: 'gpsd',
      device: '/dev/ttyAMA0',
      port: 2947,
      pid: '/tmp/gpsd.pid',
      readOnly: false,
      logger: {
        info: function () { },
        warn: console.warn,
        error: console.error
      }
    });
    const self = this
    daemon.start(function () {
      console.log('Started');

      const bancroft = new Bancroft();

      bancroft.on('connect', () => {
        console.log('GPIO connected');
      });

      bancroft.on('location', function (location) {
        self.sendNotification(location);
      });

      bancroft.on('satellite', () => { });

      bancroft.on('disconnect', () => {
        console.log('GPIO disconnected');
      });
    });
  }

  stop () {
    console.log("Stopping counter");
    clearInterval(this.handle);
    this.handle = null;
  }
}
