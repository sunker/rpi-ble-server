const GpsdClient = require('./GpsdClient')
const blenoHub = require('./blenoHub')
const GpsWorker = require('./GpsWorker')
const mongo = require('./models/mongo.js')

mongo.connect()
const gpsdClient = new GpsdClient()
const gpsdWorker = new GpsWorker(gpsdClient)
blenoHub.init(gpsdClient, gpsdWorker)

