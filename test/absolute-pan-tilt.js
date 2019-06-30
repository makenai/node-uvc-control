#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()

cam.set('absolutePanTilt', 5)
  .then(val => console.log('set absolutePanTilt to', val))
  .catch(err => console.error(err))
