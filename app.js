const GpsdClient = require('./GpsdClient')
const blenoHub = require('./blenoHub')
const gpsWorker = require('./GpsWorker')
const mongo = require('./models/mongo.js')

mongo.connect()
const gpsdClient = new GpsdClient()
blenoHub.init(gpsdClient)

gpsWorker(gpsdClient)
