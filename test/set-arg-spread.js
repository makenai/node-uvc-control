#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()

const pan = 34
const tilt = 27
cam.set('absolute_pan_tilt', pan, tilt)
  .then(val => console.log('set absolute_pan_tilt to', val))
  .catch(err => console.error(err))
