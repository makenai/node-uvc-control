#!/usr/bin/env node

const UVCControl = require('./index')
UVCControl.discover().then(results => {
  const info = results.map(result => {
    return {
      name: result.name,
      vendorId: result.deviceDescriptor.idVendor,
      productId: result.deviceDescriptor.idProduct,
      deviceAddress: result.deviceAddress,
    }
  })
  console.log(info)
})
