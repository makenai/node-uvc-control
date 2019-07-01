#!/usr/bin/env node

/*
  List default values
  TODO implement GET_DEF to actually get defaults. returns current values, currently
*/

const UVCControl = require('../index')
const cam = new UVCControl()
const controls = Object.entries(UVCControl.controls)
const run = async () => {
  // while (controls.length) {

  // }
}
run()
