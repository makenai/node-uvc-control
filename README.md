# uvc-control

Control a USB Video Class compliant webcam from node. Most modern USB webcams use a common set of controls standardized by the USB Implementers Forum. You can use this set of controls to change certain things on the camera, such as the brightness, contrast, zoom level, focus and so on.

## Example

```javascript
const UVCControl = require('uvc-control')

// get the first camera by default
const camera = new UVCControl()
// or get a specific camera
const camera = new UVCControl({vid: 0x046d, pid: 0x082d})

camera.get('autoFocus').then(value) => console.log('AutoFocus setting:', value))
camera.set('brightness', 100).then(() => console.log('Brightness set!'))

```

## Finding Your vendorId / productId

Use list-devices.js to find the right paramters.

```
$ node list-devices.js
[ { name: 'Logitech BRIO',
    vendorId: 1133,
    productId: 2142,
    deviceAddress: 7 },
  { name: 'Microsoft® LifeCam Studio(TM)',
    vendorId: 1118,
    productId: 1906,
    deviceAddress: 22 } ]
```

## Installation

Libusb is included as a submodule.

On Linux, you'll need libudev to build libusb. On Ubuntu/Debian: `sudo apt-get install build-essential libudev-dev`

On Windows, use [Zadig](https://sourceforge.net/projects/libwdi/files/zadig/) to install the WinUSB driver.

Then, just run `npm install uvc-control`


## API

```javascript
const UVCControl = require('uvc-control')
```

### UVCControl.controls

Log the names of supported controls. These controls are supported by this lib, but not necessarily by the user's device. Work is in progress on detecting device capabilities.

```javascript
UVCControl.controls.forEach(name => console.log(name))
```

### new UVCControl(options)

* **options** - object containing options
* **options.vid** - numeric vendor id of your device (see above)
* **options.pid** - numeric product id of your device (see above)

```javaScript
const camera = new UVCControl(options)
```

### camera.get( controlName )

Get the current value of the specified control by name.

```javascript
camera.get('sharpness').then(value => console.log('Sharpness is', value))
```

### camera.range( controlName )

Get the min and max value of the specified control by name. Some controls do not support this method.

```javascript
camera.range('absoluteFocus').then(range => {
  console.log(range) // [ 0, 250 ]
})
```

### camera.set( controlName, value )

Set the value of the specified control by name.

```javascript
camera.set('saturation', 100).then(val => console.log('Saturation set!'))
```

### camera.setRaw( controlName, buffer )

Some controls do not accept numbers. This is a workaround so you can give them what they need. The odd one so far is `absolutePanTilt`, which expects a buffer of two 4 byte numbers:

```javascript
const pan = 34
const tilt = 27
const buffer = new Buffer(8)
buffer.writeIntLE(pan, 0, 4)
buffer.writeIntLE(tilt, 4, 4)
camera.setRaw('absolutePanTilt', buffer).then(() => {
  console.log('Saturation set!')
})
```

### camera.close()

Done? Good. Put away your toys and release the USB device.

```javascript
camera.close()
```

## Currently Supported Controls

* autoExposureMode

    `autoExposureMode` determines whether the device will provide automatic adjustment of the exposure time and iris controls. The expected value is a bitmask:

        * manual: `0b00000001` (1)
        * auto: `0b00000010` (2)
        * shutter priority: `0b00000100` (4)
        * aperture priority: `0b00001000` (8)

* autoExposurePriority

    `autoExposurePriority` is used to specify constraints on the `absoluteExposureTime` when `autoExposureMode` is set to `auto` or `shutter priority`. A value of `0` means that the frame rate must remain constant. A value of `1` means that the frame rate may be dynamically varied by the device.

* absoluteExposureTime

    `absoluteExposureTime` is used to specify the length of exposure. This value is expressed in 100µs units, where 1 is 1/10,000th of a second, 10,000 is 1 second, and 100,000 is 10 seconds.

* absoluteFocus

    `absoluteFocus` is used to specify the distance, in millimiters to the focused target.

* absoluteZoom
* absolutePanTilt
* autoFocus
* brightness
* contrast
* saturation
* sharpness
* whiteBalanceTemperature
* backlightCompensation
* gain
* autoWhiteBalance

### Note:

This library was written with a Logitech C920 camera in mind. While it should work with any UVC complient webcam, I didn't implement things that weren't supported by my camera. You can find the full list of specs at the USB Implmentors Forum. Look for a document called *USB Device Class Definition for Video Devices Revision 1.1* at their site here: [http://www.usb.org/developers/docs/devclass_docs/](http://www.usb.org/developers/docs/devclass_docs/)

Pull requests and testers welcome!

### Credits

Written by [Pawel Szymczykowski](http://twitter.com/makenai) and based on some Objective C examples by [Dominic Szablewski](https://twitter.com/phoboslab) found at [http://phoboslab.org/log/2009/07/uvc-camera-control-for-mac-os-x](http://phoboslab.org/log/2009/07/uvc-camera-control-for-mac-os-x). Maintained by [Josh Beckwith](https://github.com/positlabs).
