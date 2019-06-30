const usb = require('usb')

const UVC_SET_CUR = 0x01
const UVC_GET_CUR = 0x81
const UVC_GET_MIN = 0x82
const UVC_GET_MAX = 0x83

// See USB Device Class Definition for Video Devices Revision 1.1
// http://www.usb.org/developers/docs/devclass_docs/
// Specifically:
// - 4.2 VideoControl Requests
// - A.9. Control Selector Codes

const Controls = {
  // ==============
  // Input Terminal
  // ==============
  autoExposureMode: {
    // D0: UVCControl.EXPOSURE_MANUAL - Manual Mode – manual Exposure Time, manual Iris
    // D1: UVCControl.EXPOSURE_AUTO - Auto Mode – auto Exposure Time, auto Iris
    // D2: UVCControl.EXPOSURE_PRIORITY_SHUTTER - Shutter Priority Mode – manual Exposure Time, auto Iris
    // D3: UVCControl.EXPOSURE_PRIORITY_APERTURE - Aperture Priority Mode – auto Exposure Time, manual Iris
    // D4..D7: Reserved, set to zero.
    type: 'inputTerminal',
    selector: 0x02,
    size: 1
  },
  autoExposurePriority: {
    type: 'inputTerminal',
    selector: 0x03,
    size: 1
  },
  absoluteExposureTime: {
    type: 'inputTerminal',
    selector: 0x04,
    size: 4
  },
  absoluteFocus: {
    type: 'inputTerminal',
    selector: 0x06,
    size: 2
  },
  absoluteZoom: {
    type: 'inputTerminal',
    selector: 0x0B,
    size: 2
  },
  absolutePanTilt: {
    type: 'inputTerminal',
    selector: 0x0D,
    size: 8 // dwPanAbsolute (4 bytes) + dwTiltAbsolute (4 bytes)
  },
  autoFocus: {
    type: 'inputTerminal',
    selector: 0x08,
    size: 1
  },
  // ===============
  // Processing Unit
  // ===============
  brightness: {
    type: 'processingUnit',
    selector: 0x02,
    size: 2
  },
  contrast: {
    type: 'processingUnit',
    selector: 0x03,
    size: 2
  },
  saturation: {
    type: 'processingUnit',
    selector: 0x07,
    size: 2
  },
  sharpness: {
    type: 'processingUnit',
    selector: 0x08,
    size: 2
  },
  whiteBalanceTemperature: {
    type: 'processingUnit',
    selector: 0x0A,
    size: 2
  },
  backlightCompensation: {
    type: 'processingUnit',
    selector: 0x01,
    size: 2
  },
  gain: {
    type: 'processingUnit',
    selector: 0x04,
    size: 2
  },
  autoWhiteBalance: {
    type: 'processingUnit',
    selector: 0x0B,
    size: 1
  }
}

class UVCControl {

  constructor(options = {}) {
    this.options = options
    this.init()
    if (!this.device) throw Error('No device found, using options:', options)
    const descriptors = getInterfaceDescriptors(this.device)
    this.ids = {
      processingUnit: descriptors.processingUnit.id,
      inputTerminal: descriptors.inputTerminal.id,
    }
  }

  init() {

    if (this.options.vid && this.options.pid && this.options.deviceAddress) {

      // find cam with vid / pid / deviceAddress
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device) &&
          device.deviceDescriptor.idVendor === this.options.vid &&
          device.deviceDescriptor.idProduct === this.options.pid &&
          device.deviceAddress === this.options.deviceAddress
      })[0]

    } else if (this.options.vid && this.options.pid) {

      // find a camera that matches the vid / pid
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device) &&
          device.deviceDescriptor.idVendor === this.options.vid &&
          device.deviceDescriptor.idProduct === this.options.pid
      })[0]

    } else if (this.options.vid) {

      // find a camera that matches the vendor id
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device) &&
          device.deviceDescriptor.idVendor === this.options.vid
      })[0]

    } else {

      // no options... use the first camera in the device list
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device)
      })[0]
    }

    if (this.device) {
      this.device.open()
      this.interfaceNumber = detectVideoControlInterface(this.device)
    }
  }

  getControlParams(id) {
    if (!this.device) {
      throw Error('USB device not found with vid 0x' + this.options.vid.toString(16) + ', pid 0x' + this.options.pid.toString(16))
    }
    if (this.interfaceNumber === undefined) {
      throw Error('UVC compliant device not found.')
    }
    var control = Controls[id]
    if (!control) {
      throw Error('UVC Control identifier not recognized: ' + id)
    }

    var unit = this.ids[control.type]
    var params = {
      wValue: (control.selector << 8) | 0x00,
      wIndex: (unit << 8) | this.interfaceNumber,
      wLength: control.size
    }
    return params
  }

  /**
   * Close the device
   */
  close() {
    this.device.close()
  }

  /**
   * Get the value of a control
   * @param {string} controlName
   */
  get(id) {
    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      this.device.controlTransfer(0b10100001, UVC_GET_CUR, params.wValue, params.wIndex, params.wLength, (error, buffer) => {
        if (error) reject(error)
        else resolve(readInt(buffer, params.wLength))
      })
    })
  }

  /**
   * Set the value of a control
   * @param {string} controlId
   * @param {number||buffer} value
   */
  set(id, value) {
    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      let data = value
      if (!(value instanceof Buffer)) {
        data = Buffer.alloc(params.wLength)
        writeInt(data, value, params.wLength)
      }
      this.device.controlTransfer(0b00100001, UVC_SET_CUR, params.wValue, params.wIndex, data, (err) => {
        if (err) reject(err)
        else resolve(value)
      })
    })
  }

  /**
   * Set the raw value of a control
   * @param {string} controlId
   * @param {buffer} value
   */
  // setRaw(id, value) {
  //   return new Promise((resolve, reject) => {
  //     const params = this.getControlParams(id)
  //     this.device.controlTransfer(0b00100001, UVC_SET_CUR, params.wValue, params.wIndex, value, (err) => {
  //       if (err) reject(err)
  //       else resolve(value)
  //     })
  //   })
  // }

  /**
   * Get the min and max range of a control
   * @param {string} controlName
   */
  range(id) {
    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      this.device.controlTransfer(0b10100001, UVC_GET_MIN, params.wValue, params.wIndex, params.wLength, (error, min) => {
        if (error) return reject(error)
        this.device.controlTransfer(0b10100001, UVC_GET_MAX, params.wValue, params.wIndex, params.wLength, (error, max) => {
          if (error) return reject(error)
          resolve([min.readIntLE(0, params.wLength), max.readIntLE(0, params.wLength)])
        })
      })
    })
  }
}

/*
  Class level stuff
*/
UVCControl.EXPOSURE_MANUAL = 0b00000001
UVCControl.EXPOSURE_AUTO = 0b00000010
UVCControl.EXPOSURE_PRIORITY_SHUTTER = 0b00000100
UVCControl.EXPOSURE_PRIORITY_APERTURE = 0b00001000

/**
 * Discover uvc devices
 */
UVCControl.discover = () => {
  return new Promise((resolve, reject) => {
    var promises = usb.getDeviceList().map(UVCControl.validate)
    Promise.all(promises).then(results => {
      resolve(results.filter(w => w)) // rm nulls
    }).catch(err => reject(err))
  })
}

/**
 * Check if device is a uvc device
 * @param {object} device
 */
UVCControl.validate = (device) => {
  return new Promise((resolve, reject) => {

    if (device.deviceDescriptor.iProduct) {
      device.open()

      // http://www.usb.org/developers/defined_class/#BaseClass10h
      if (isWebcam(device)) {
        device.getStringDescriptor(device.deviceDescriptor.iProduct, (error, deviceName) => {
          if (error) return reject(error)
          device.close()
          device.name = deviceName
          resolve(device)
        })
      } else resolve(false)
    } else resolve(false)
  })
}

/**
 * Get list of recognized controls
 * @return {Array} controls
 */
UVCControl.controls = Object.keys(Controls)

/**
 * Given a USB device, iterate through all of the exposed interfaces looking for
 * the one for VideoControl. bInterfaceClass = CC_VIDEO (0x0e) and
 * bInterfaceSubClass = SC_VIDEOCONTROL (0x01)
 * @param  {object} device
 * @return {object} interface
 */
function detectVideoControlInterface(device) {
  const {
    interfaces
  } = device
  for (let i = 0; i < interfaces.length; i++) {
    if (interfaces[i].descriptor.bInterfaceClass == 0x0e &&
      interfaces[i].descriptor.bInterfaceSubClass == 0x01
    ) {
      return i
    }
  }
}

/**
 * Check the device class / subclass and assert that it is a webcam
 * @param {object} device
 * @return {Boolean}
 */
function isWebcam(device) {
  // http://www.usb.org/developers/defined_class/#BaseClass10h
  return device.deviceDescriptor.bDeviceClass === 239 &&
    device.deviceDescriptor.bDeviceSubClass === 2
}

function readInt(buffer, length) {
  if (length === 8) {
    var low = 0 & 0xffffffff
    var high = (0 - low) / 0x100000000 - (low < 0 ? 1 : 0)
    return buffer.readIntLE(low) + buffer.readUIntLE(high, 4)
  } else {
    return buffer.readIntLE(0, length)
  }
}

function writeInt(buffer, value, length) {
  if (length === 8) {
    var low = 0 & 0xffffffff
    var high = (0 - low) / 0x100000000 - (low < 0 ? 1 : 0)
    return buffer.writeIntLE(value, low) + buffer.writeUIntLE(value, high, 4)
  } else {
    return buffer.writeIntLE(value, 0, length)
  }
}

function getInterfaceDescriptors(device) {
  // find the VC interface
  // VC Interface Descriptor is a concatenation of all the descriptors that are used to fully describe
  // the video function, i.e., all Unit Descriptors (UDs) and Terminal Descriptors (TDs)
  const vcInterface = device.interfaces.filter(interface => {
    const {
      descriptor
    } = interface
    return descriptor.bInterfaceNumber === 0x00 &&
      descriptor.bInterfaceClass === 0x0e &&
      descriptor.bInterfaceSubClass === 0x01
  })[0]

  // parse the descriptors in the extra field
  let data = vcInterface.descriptor.extra.toJSON().data
  let descriptorArrays = []
  while (data.length) {
    let bLength = data[0]
    let arr = data.splice(0, bLength)
    descriptorArrays.push(arr)
  }

  // find the processing unit descriptor
  const pUD = descriptorArrays.filter(arr => arr[0] === 0x0B && arr[1] === 0x24 && arr[2] === 0x05)[0]
  const processingUnit = {
    id: pUD[3]
  }

  // find input terminal descriptor
  const iTD = descriptorArrays.filter(arr => arr[0] === 0x12 && arr[1] === 0x24 && arr[2] === 0x02)[0]
  const inputTerminal = {
    id: iTD[3]
  }

  return {
    processingUnit,
    inputTerminal,
  }
}

module.exports = UVCControl
