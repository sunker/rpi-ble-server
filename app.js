const GpsdClient = require('./GpsdClient')
const blenoHub = require('./blenoHub')
const gpsWorker = require('./GpsWorker')

const gpsdClient = new GpsdClient()
blenoHub.init(gpsdClient)

gpsWorker(gpsdClient)
