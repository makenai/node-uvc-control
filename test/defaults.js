#!/usr/bin/env node

/*
	List default values
*/

const UVCControl = require('../index');
const cam = new UVCControl();

UVCControl.controls.map(name => {
	cam.get(name, (err, val) => {
		if(err) throw err;
		console.log(name, val);
	});
});
