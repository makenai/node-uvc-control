#!/usr/bin/env node

/*
	Get a device based on vendor ID, product ID, and device address. 
	Useful if using multiple of the same webcam
  These values can be found by running ./discover.js
*/

const UVCControl = require('../index');

const cam = new UVCControl({
	vid: 1133,
	pid: 2142,
	deviceAddress: 25
});

UVCControl.controls.map(name => {
	cam.get(name, (err, val) => {
		if(err) throw err;
		console.log(name, val);
	});
});
