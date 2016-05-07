var usb = require('usb');

var devices = usb.getDeviceList();
devices.forEach(function(device) {
  var vendorId = device.deviceDescriptor.idVendor;
  var productId = device.deviceDescriptor.idProduct;
  if (device.deviceDescriptor.iProduct) {
    device.open();
    var name = device.getStringDescriptor(device.deviceDescriptor.iProduct, function(error,product) {
      console.log( product, '[ vId: 0x'+vendorId.toString(16), ' / pId: 0x'+productId.toString(16), ' ]');
      device.close();
    });
  }
});