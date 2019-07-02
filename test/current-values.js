#!/usr/bin/env node

/*
  List current values
*/

const UVCControl = require('../index')
const cam = new UVCControl()
const controls = Object.entries(UVCControl.controls)
const run = async () => {
  while (controls.length) {
    const [name, control] = controls.shift()
    try {
      const val = await cam.get(name)
      console.log(name, Object.values(val)[0])
      console.log('=============')
    } catch (err) {
      if (err.error.toString() === 'Error: LIBUSB_TRANSFER_STALL') {
        // console.error('device does not support', name)
      } else {
        console.error('failed!', err)
        console.log('=============')
      }
    }
  }
}
run()
