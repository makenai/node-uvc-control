#!/usr/bin/env node

/*
  List default values
*/

const UVCControl = require('../index')

const run = async () => {
  const cam = new UVCControl()
  const supportedControls = cam.supportedControls.filter(name => {
    const control = UVCControl.controls[name]
    return control.requests.indexOf(UVCControl.REQUEST.GET_DEF) !== -1
  })
  console.log(supportedControls)
  for (const name of supportedControls){
    await cam.getDefault(name)
      .then(def => console.log(def))
      .catch(err => console.error(err))
  }
  cam.close()
}

run()
