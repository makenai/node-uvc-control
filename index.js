const usb = require('usb')
const {
  PU,
  BM_REQUEST_TYPE,
  REQUEST
} = require('./lib/constants')
const controls = require('./lib/controls')

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
    const control = controls[id]
    if (!control) {
      throw Error('UVC Control identifier not recognized: ' + id)
    }

    const controlType = Object.values(PU).indexOf(control.selector) !== -1 ? 'processingUnit' : 'inputTerminal'
    const unit = this.ids[controlType]
    const params = {
      wValue: (control.selector << 8) | 0x00,
      wIndex: (unit << 8) | this.interfaceNumber,
      wLength: control.wLength
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
    const control = controls[id]
    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_CUR, params.wValue, params.wIndex, params.wLength, (error, buffer) => {
        if (error) return reject({
          id,
          error
        })
        const fields = {}
        control.fields.forEach(field => {
          // console.log(field.name, field.offset, field.size, buffer.byteLength)
          // sometimes the field doesn't take up the space it has
          const size = Math.min(field.size, buffer.byteLength)
          // sometimes the field isn't there...?
          if (field.offset === field.size) return
          fields[field.name] = buffer.readIntLE(field.offset, size)
        })
        resolve(fields)
      })
    })
  }

  /**
   * Set the value of a control
   * @param {string} controlId
   * @param {number} ...values
   */
  set(id, ...values) {
    return new Promise((resolve, reject) => {
      const control = controls[id]
      const params = this.getControlParams(id)
      // let data = value
      // if (!(value instanceof Buffer)) {
      //   data = Buffer.alloc(params.wLength)
      //   writeInt(data, value, params.wLength)
      // }
      const data = Buffer.alloc(params.wLength)
      control.fields.forEach((field, i) => {
        data.writeIntLE(values[i], field.offset, field.size)
      })

      this.device.controlTransfer(BM_REQUEST_TYPE.SET, REQUEST.SET_CUR, params.wValue, params.wIndex, data, (err) => {
        if (err) reject(err)
        else resolve(value)
      })
    })
  }
  /**
   * Get the min and max range of a control
   * @param {string} controlName
   */
  range(id) {
    const control = controls[id]
    if (control.requests.indexOf(REQUEST.GET_MIN) === -1) {
      throw Error('range request not supported for ', id)
    }

    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      // TODO promise wrapper for controlTransfer so we can do parallel requests
      this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_MIN, params.wValue, params.wIndex, params.wLength, (error, min) => {
        if (error) return reject(error)
        this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_MAX, params.wValue, params.wIndex, params.wLength, (error, max) => {
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

UVCControl.controls = controls
UVCControl.REQUEST = REQUEST

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
