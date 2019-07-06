#!/usr/bin/env node

/*
	List UVC devices
*/

const UVCControl = require('../index')

UVCControl.discover().then(results => {
  results.forEach(result => {
    console.log({
      name: result.name,
      vendorId: result.deviceDescriptor.idVendor,
      productId: result.deviceDescriptor.idProduct,
      deviceAddress: result.deviceAddress,
    })
  })
}).catch(err => console.error(err))
