#!/usr/bin/env node

/*
  Get a device based on vendor ID and product ID
  These values can be found by running ./discover.js

  Usage: ./test/vid-pid.js 1133 2142
*/

const UVCControl = require('../index')

const run = async () => {
  const vid = parseInt(process.argv[2]) || 0
  const pid = parseInt(process.argv[3]) || 0

  const cam = new UVCControl({
    vid: vid,
    pid: pid
  })

  if (cam.device.deviceDescriptor.idVendor !== vid) console.error(`Input vendor ID (${vid}) does not match device vendor ID (${cam.device.deviceDescriptor.idVendor})`)
  if (cam.device.deviceDescriptor.idProduct !== pid) console.error(`Input product ID (${pid}) does not match device vendor ID (${cam.device.deviceDescriptor.idProduct})`)

  console.log(cam)

  for (const name of Object.keys(UVCControl.controls)) {
    await cam.get(name).then(val => {
      console.log(name, val)
    }).catch(error => console.error(name, error))
  }

  cam.close()
}

run()
