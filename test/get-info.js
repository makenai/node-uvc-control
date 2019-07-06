#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()
const name = process.argv[2] || 'all'
let controlNames = [name]

if (name === 'all') {
  controlNames = cam.supportedControls.filter(name => {
    return UVCControl.controls[name].requests.indexOf(UVCControl.REQUEST.GET_INFO) !== -1
  })
}

controlNames.map(name => {
  cam.getInfo(name).then(info => {
    console.log(name, info)
  }).catch(err => console.log(err))
})
