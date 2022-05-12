#!/usr/bin/env node

/*
  Get a device based on vendor ID
  These values can be found by running ./discover.js

  Usage: ./test/vid.js 1133
*/

const UVCControl = require('../index')

const run = async () => {
  const vid = parseInt(process.argv[2]) || 0

  const cam = new UVCControl({
    vid: vid
  })

  if (cam.device.deviceDescriptor.idVendor !== vid) console.error(`Input vendor ID (${vid}) does not match device vendor ID (${cam.device.deviceDescriptor.idVendor})`)

  console.log(cam)

  for (const name of Object.keys(UVCControl.controls)) {
    await cam.get(name).then(val => {
      console.log(name, val)
    }).catch(error => console.error(name, error))
  }

  cam.close()
}

run()
