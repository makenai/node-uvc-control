#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()
console.log(cam.supportedControls)
cam.close()
