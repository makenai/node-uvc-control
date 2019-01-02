#!/usr/bin/env node

/*
	Get a device based on vendor ID, product ID, and device address. 
	Useful if using multiple of the same webcam
  These values can be found by running ./discover.js
  
  Usage: ./test/vid-pid-deviceaddress.js 1133 2142 25
*/

const UVCControl = require('../index');
const vid = parseInt(process.argv[2]) || 1133
const pid = parseInt(process.argv[3]) || 2142
const deviceAddress = parseInt(process.argv[4]) || 25

const cam = new UVCControl({
	vid: vid,
	pid: pid,
	deviceAddress: deviceAddress
});

if(cam.device.deviceDescriptor.idVendor !== vid) console.error(`Input vendor ID (${vid}) does not match device vendor ID (${cam.device.deviceDescriptor.idVendor})`);
if(cam.device.deviceDescriptor.idProduct !== pid) console.error(`Input product ID (${pid}) does not match device vendor ID (${cam.device.deviceDescriptor.idProduct})`);
if(cam.deviceAddress !== deviceAddress) console.error(`Input device address (${deviceAddress}) does not match device address (${cam.deviceAddress})`);

console.log(cam);

UVCControl.controls.map(name => {
	cam.get(name, (err, val) => {
		if(err) throw err;
		console.log(name, val);
	});
});
