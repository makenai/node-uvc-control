#!/usr/bin/env node

/*
  List default values
*/

const UVCControl = require('../index')
const cam = new UVCControl()

UVCControl.controls.map(name => {
  cam.get(name)
    .then(val => console.log(name, val))
    .catch(err => console.error('failed!', name, err))
})
