#!/usr/bin/env node


const UVCControl = require('../index')
const cam = new UVCControl()

const name = 'still_image_trigger'
const trigger = UVCControl.controls[name]
// cam.set(name, trigger.fields[0].options.TRANSMIT_BULK)

cam.close()
