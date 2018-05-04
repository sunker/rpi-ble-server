const bleno = require('bleno')
const GpsPulseCharacteristic = require('./GpsPulseCharacteristic')
const GpsRouteCharacteristic = require('./GpsRouteCharacteristic')
const COUNTER_SERVICE_UUID = '00010000-9FAB-43C8-9231-40F6E305F96D'
const GPS_CHAR_UUID = '00010001-9FAB-43C8-9231-40F6E305F96E'
const GPS_ROUTE_CHAR_UUID = '00010001-9FAB-43C8-9231-40F6E305F96F'

module.exports = {
  init: (gpsdClient) => {
    let gps = new GpsPulseCharacteristic(gpsdClient, GPS_CHAR_UUID)
    let gpsRoute = new GpsRouteCharacteristic(GPS_ROUTE_CHAR_UUID)
    bleno.on("stateChange", state => {
      if (state === "poweredOn") {

        bleno.startAdvertising("Counter", [COUNTER_SERVICE_UUID], err => {
          if (err) console.log(err)
        })

      } else {
        console.log("Stopping...")
        gps.stop()
        gpsRoute.stop()
        bleno.stopAdvertising()
      }
    })

    bleno.on("advertisingStart", err => {
      console.log("Configuring services...")
      if (err) {
        console.error(err)
        return
      }

      let service = new bleno.PrimaryService({
        uuid: GPS_CHAR_UUID,
        characteristics: [gps, gpsRoute]
      })

      bleno.setServices([service], err => {
        if (err)
          console.log(err)
        else
          console.log("Services configured")
      })
    })

    bleno.on("stateChange", state => console.log(`Bleno: Adapter changed state to ${state}`))

    bleno.on("advertisingStart", err => console.log("Bleno: advertisingStart"))
    bleno.on("advertisingStartError", err => console.log("Bleno: advertisingStartError"))
    bleno.on("advertisingStop", err => console.log("Bleno: advertisingStop"))

    bleno.on("servicesSet", err => console.log("Bleno: servicesSet"))
    bleno.on("servicesSetError", err => console.log("Bleno: servicesSetError"))

    bleno.on("accept", clientAddress => console.log(`Bleno: accept ${clientAddress}`))
    bleno.on("disconnect", clientAddress => console.log(`Bleno: disconnect ${clientAddress}`))
  }
}