const GpsdClient = require('./GpsdClient')
const blenoHub = require('./blenoHub')

const gpsdClient = new GpsdClient()
blenoHub.init(gpsdClient)

