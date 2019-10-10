#!/usr/bin/env node

/*
  Get a device based on vendor ID
  These values can be found by running ./discover.js

  Usage: ./test/vid.js 1133
*/

const UVCControl = require('../index')
const vid = parseInt(process.argv[2]) || 1133

const cam = new UVCControl({
  vid: vid
})

if (cam.device.deviceDescriptor.idVendor !== vid) console.error(`Input vendor ID (${vid}) does not match device vendor ID (${cam.device.deviceDescriptor.idVendor})`)

console.log(cam)

Object.keys(UVCControl.controls).map(name => {
  cam.get(name).then(val => {
    console.log(name, val)
  }).catch(error => console.error(name, error))
})
