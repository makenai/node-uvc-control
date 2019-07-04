#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()
const name = process.argv[2] || 'all'
let controlNames = [name]
if (name === 'all') {
  controlNames = cam.supportedControls.filter(name => {
    return UVCControl.controls[name].requests.indexOf(UVCControl.REQUEST.GET_CUR) !== -1
  })
}
controlNames.forEach(name => {
  cam.get(name).then(def => {
    console.log('current', name, def)
  }).catch(err => console.log(err))
})
