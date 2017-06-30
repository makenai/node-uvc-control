#!/usr/bin/env node

const UVCControl = require('../index');

var cam = new UVCControl();

UVCControl.controls.map(name => {
	cam.get(name, (err, val) => {
		if(err) throw err;
		console.log(name, val);
	});
});
