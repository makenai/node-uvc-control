#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()
console.log(cam.supportedControls)
cam.close()
// cam.on('initialized', () => console.log('Supported controls:', Object.keys(cam.supportedControls)))
