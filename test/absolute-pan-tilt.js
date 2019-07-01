#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()

const pan = 34
const tilt = 27
const buffer = Buffer.alloc(8)
buffer.writeIntLE(pan, 0, 4)
buffer.writeIntLE(tilt, 4, 4)
cam.set('absolutePanTilt', buffer)
  .then(val => console.log('set absolutePanTilt to', val))
  .catch(err => console.error(err))
