#!/usr/bin/env node

const usb = require('usb')

const devices = usb.getDeviceList()
devices.forEach((device) => {
  const vendorId = device.deviceDescriptor.idVendor
  const productId = device.deviceDescriptor.idProduct
  if (device.deviceDescriptor.iProduct) {
    device.open()
    const name = device.getStringDescriptor(device.deviceDescriptor.iProduct, (error, product) => {
      if (error) return console.error(error)
      // console.log(device)
      console.log(product, {
        vendorId: '0x' + vendorId.toString(16),
        productId: '0x' + productId.toString(16),
        deviceAddress: '0x' + device.deviceAddress.toString(16),
      })
      device.close()
    })
  }
})
