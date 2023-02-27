#!/usr/bin/env node

/*
  Get a device based on device address.
  Unlikely to be used by itself, should be used with vendor and product id.
  These values can be found by running ./discover.js

  Usage: ./test/deviceaddress.js 13
*/

const UVCControl = require('../index')

const run = async () => {
  const deviceAddress = parseInt(process.argv[2]) || 0

  const cam = new UVCControl({
    deviceAddress: deviceAddress
  })

  if (cam.device.deviceAddress !== deviceAddress) console.error(`Input device address (${deviceAddress}) does not match device address (${cam.device.deviceAddress})`)

  console.log(cam)

  for (const name of Object.keys(UVCControl.controls)) {
    await cam.get(name).then(val => {
      console.log(name, val)
    }).catch(error => console.error(name, error))
  }

  cam.close()
}

run()
