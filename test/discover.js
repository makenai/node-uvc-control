#!/usr/bin/env node

/*
	List UVC devices
*/

const UVCControl = require('../index');

UVCControl.discover().then(results => {
  console.log(results);
});
