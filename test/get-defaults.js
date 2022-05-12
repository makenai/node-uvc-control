#!/usr/bin/env node

const UVCControl = require('../index')

const run = async () => {
  const cam = new UVCControl()
  const name = process.argv[2] || 'all'
  let controlNames = [name]
  if (name === 'all') {
    controlNames = cam.supportedControls.filter(name => {
      return UVCControl.controls[name].requests.indexOf(UVCControl.REQUEST.GET_DEF) !== -1
    })
  }
  for (const name of controlNames) {
    await cam.getDefault(name).then(def => {
      console.log('default', name, def)
    }).catch(err => console.log(err))
  }

  cam.close()
}

run()
