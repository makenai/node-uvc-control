#!/usr/bin/env node

/*
  Get a device based on vendor ID and product ID
  These values can be found by running ./discover.js
  
  Usage: ./test/vid-pid.js 1133 2142
*/

const UVCControl = require('../index');
const vid = parseInt(process.argv[2]) || 1133
const pid = parseInt(process.argv[3]) || 2142

const cam = new UVCControl({
  vid: vid,
  pid: pid
});

UVCControl.controls.map(name => {
  cam.get(name, (err, val) => {
    if(err) throw err;
    console.log(name, val);
  });
});
