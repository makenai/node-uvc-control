#!/usr/bin/env node

const UVCControl = require('../index')

const run = async () => {
  const cam = new UVCControl()

  const pan = 34
  const tilt = 27
  await cam.set('absolute_pan_tilt', pan, tilt)
    .then(val => console.log('set absolute_pan_tilt to', val))
    .catch(err => console.error(err))

  cam.close()
}

run()
