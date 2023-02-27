#!/usr/bin/env node

/*
  Get a device based on product ID
  These values can be found by running ./discover.js

  Usage: ./test/pid.js 2142
*/

const UVCControl = require('../index')

const run = async () => {
  const pid = parseInt(process.argv[2]) || 0

  const cam = new UVCControl({
    pid: pid
  })

  if (cam.device.deviceDescriptor.idProduct !== pid) console.error(`Input product ID (${pid}) does not match device product ID (${cam.device.deviceDescriptor.idProduct})`)

  console.log(cam)

  for (const name of Object.keys(UVCControl.controls)) {
    await cam.get(name).then(val => {
      console.log(name, val)
    }).catch(error => console.error(name, error))
  }

  cam.close()
}

run()
