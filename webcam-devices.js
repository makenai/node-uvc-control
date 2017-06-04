/*

	getWebcams()
		Promises a list of WebcamDevices

		webcamDevices.getWebcams().then(webcams => console.log(webcams))

	new WebcamDevice(name, device)
		Just a nice way to store some info about a particular webcam

	WebcamDevice.validate(device)
		Promises either a valid WebcamDevice instance, or false.
		Used in getWebcams, but can also be used when detecting hotplugged webcams.

*/


// https://www.npmjs.com/package/usb
const usb = require('usb')

const WebcamDevice = function(name, device){

	this.name = name
	this.device = device
	this.vendorId = '0x' + device.deviceDescriptor.idVendor.toString(16)
	this.productId = '0x' + device.deviceDescriptor.idProduct.toString(16)
}

WebcamDevice.validate = device => { return new Promise((resolve, reject) => {
	if (device.deviceDescriptor.iProduct) {
		device.open()
		// http://www.usb.org/developers/defined_class/#BaseClass10h
		if(device.deviceDescriptor.bDeviceClass === 239 && device.deviceDescriptor.bDeviceSubClass === 2){
			device.getStringDescriptor(device.deviceDescriptor.iProduct, (error, deviceName) => {
				if(error) throw error
				device.close()
				resolve( new WebcamDevice(deviceName, device) )
			})			
		}else resolve(false)
	}else resolve(false)
})}

const getWebcams = () => { return new Promise((resolve, reject) => {

	var promises = usb.getDeviceList().map(WebcamDevice.validate)
	Promise.all(promises).then(results => {
		resolve(results.filter(w => w))
	})

})}

module.exports = {
	getWebcams,
	WebcamDevice
}
