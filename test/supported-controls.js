#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()
// const controls = Object.entries(UVCControl.controls)
cam.on('initialized', () => console.log('Supported controls:', Object.keys(cam.supportedControls)))
