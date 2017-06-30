#!/usr/bin/env node

const UVCControl = require('../index');

UVCControl.discover().then(results => {
    console.log(results);
});
