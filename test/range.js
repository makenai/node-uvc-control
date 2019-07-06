#!/usr/bin/env node

const UVCControl = require('../index')
const cam = new UVCControl()
const name = process.argv[2] || 'all'
let controlNames = [name]
if (name === 'all') {
  controlNames = cam.supportedControls.filter(name => {
    return UVCControl.controls[name].requests.indexOf(UVCControl.REQUEST.GET_MIN) !== -1
  })
}
console.log('controls with range support:', controlNames)
controlNames.forEach((name, i) => {
  // setTimeout(() => {
  // console.log('getting range for', name)
  cam.range(name).then(def => {
    console.log('range', name, def)
  }).catch(err => console.log(name, err))
  // }, i * 1000)
})
