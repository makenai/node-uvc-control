<p align="center">
  <a href="https://joelpurra.com/projects/uvcc/"><img src="https://files.joelpurra.com/projects/uvcc/demo/2020-09-02/uvcc-demo.2020-09-02.gif" alt="uvcc demo video showing rubber ducks and a candle with varying camera settings" width="480" height="270" border="0" /></a>
</p>

# Fork of [`uvc-control`](https://github.com/makenai/node-uvc-control) for [`uvcc`](https://joelpurra.com/projects/uvcc/)

This fork has important bugfixes and improvements required for the _USB Video Class (UVC) device configurator_ [`uvcc`](https://joelpurra.com/projects/uvcc/) to work properly. It was based on the [`master`](https://github.com/makenai/node-uvc-control/commit/master) ([`ca1e2c9`](https://github.com/makenai/node-uvc-control/commit/ca1e2c963e98b309ad3b65c5fc538f052ea5fd64)) branch of [`uvc-control`](https://github.com/makenai/node-uvc-control) from 2019-07-07; see the [`v2`](https://github.com/joelpurra/node-uvc-control/commits/v2) branch for [changes](https://github.com/makenai/node-uvc-control/compare/master...joelpurra:v2).

The stability of this fork is not guaranteed. Branches can be force-pushed and broken; if and when this fork gets [merged upstream](https://github.com/makenai/node-uvc-control/pull/66) it will be deleted.

See

- https://github.com/makenai/node-uvc-control/pull/66
- https://github.com/joelpurra/node-uvc-control/commits/v2
- https://github.com/joelpurra/node-uvc-control/tree/v2
- https://github.com/makenai/node-uvc-control/compare/master...joelpurra:v2
- https://github.com/makenai/node-uvc-control/commit/master
- https://github.com/makenai/node-uvc-control/commit/ca1e2c963e98b309ad3b65c5fc538f052ea5fd64

---

# uvc-control

Control a USB Video Class compliant webcam from node. Most modern USB webcams use a common set of controls standardized by the USB Implementers Forum. You can use this set of controls to change certain things on the camera, such as the brightness, contrast, zoom level, focus and so on.

See also [`uvcc`](https://github.com/joelpurra/uvcc), which wraps uvc-control in a command line tool.

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

For an interactive demo, run `npm start` in `./examples/server/` and open: http://localhost:3000/

## Finding Your vendorId / productId

Use test/discover.js to find the right paramters.

```
$ node test/discover.js
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

### new UVCControl(options)

* **options** - object containing options
* **options.vid** - vendor id of your device
* **options.pid** - product id of your device
* **options.deviceAddress** - device address

```javaScript
const camera = new UVCControl(options)
```

### List controls

Log the names of controls. You can get all controls, or a list of controls supported by the device.

```javascript
UVCControl.controls.forEach(name => console.log(name))
console.log(cam.supportedControls)
```

### camera.get( control_name )

Get the current value of the specified control by name.

```javascript
camera.get('sharpness').then(value => console.log('sharpness', value))
```

### camera.range( control_name )

Get the min and max value of the specified control by name. Some controls do not support this method.

```javascript
camera.range('absolute_focus').then(range => {
  console.log(range) // { min: 0, max: 250 }
})
```

### camera.set( control_name, value )

Set the value of the specified control by name.

```javascript
camera.set('saturation', 100).then(() => console.log('saturation set!'))
```

### camera.set( control_name, ...values )

Some controls have multiple fields. You can pass multiple values that align with the field offsets.

```javascript
const pan = 34
const tilt = 27
camera.set('absolute_pan_tilt', pan, tilt).then(() => {
  console.log('absolute_pan_tilt set!')
})
```

### camera.close()

Done? Good. Put away your toys and release the USB device.

```javascript
camera.close()
```

### Notes

You can find the full list of specs at the USB Implmentors Forum. Look for a document called *USB Device Class Definition for Video Devices Revision 1.1* at their site here: [http://www.usb.org/developers/docs/devclass_docs/](http://www.usb.org/developers/docs/devclass_docs/) [pdf mirror](http://www.cajunbot.com/wiki/images/8/85/USB_Video_Class_1.1.pdf)

To debug the USB descriptors, open chrome://usb-internals in Chrome

On Raspberry Pi, you need to run node as root in order to access USB devices. If you don't have access, you'll get a `LIBUSB_ERROR_IO` error on initialization. Alternatively, you can add a udev rule to grant access to the default user, as described in [this AskUbuntu answer](https://askubuntu.com/questions/978552/how-do-i-make-libusb-work-as-non-root).

Pull requests and testers welcome!

### Credits

Written by [Pawel Szymczykowski](http://twitter.com/makenai) and based on some Objective C examples by [Dominic Szablewski](https://twitter.com/phoboslab) found at [http://phoboslab.org/log/2009/07/uvc-camera-control-for-mac-os-x](http://phoboslab.org/log/2009/07/uvc-camera-control-for-mac-os-x). Maintained by [Josh Beckwith](https://github.com/positlabs).
