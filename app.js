var gpsd = require('node-gpsd');
const Bancroft = require('bancroft');

var daemon = new gpsd.Daemon({
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

daemon.start(function () {
  console.log('Started');

  const bancroft = new Bancroft();

  bancroft.on('connect', () => {
    console.log('GPIO connected');
  });

  bancroft.on('location', (location) => {
    console.log(location)
  });

  bancroft.on('satellite', () => { });

  bancroft.on('disconnect', () => {
    console.log('GPIO disconnected');
  });
});