const usb = require('usb')
const {
  SC,
  CC,
  VC,
  CS,
  // VS,
  // VS_DESCRIPTOR_SUBTYPE,
  BM_REQUEST_TYPE,
  FIELD_TYPE,
  REQUEST,
  KEY,
} = require('./lib/constants')
const controls = require('./lib/controls')
const EventEmitter = require('events').EventEmitter

class UVCControl extends EventEmitter {

  constructor(options = {}) {
    super()
    this.options = options
    this.init()
    if (!this.device) throw Error('No device found, using options:', options)
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

    } else if (this.options.pid) {

      // find a camera that matches the product id
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device) &&
          device.deviceDescriptor.idProduct === this.options.pid
      })[0]

    } else if (this.options.deviceAddress) {

      // find a camera that matches the deviceAddress
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device) &&
          device.deviceAddress === this.options.deviceAddress
      })[0]

    } else {

      // no options... use the first camera in the device list
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device)
      })[0]
    }

    if (this.device) {
      this.device.open()
      this.videoControlInterfaceNumber = detectVideoControlInterface(this.device)
    }

    const descriptors = getInterfaceDescriptors(this.device)
    this.ids = {
      processingUnit: descriptors.processingUnit.bUnitID,
      cameraInputTerminal: descriptors.cameraInputTerminal.bTerminalID,
    }

    this.supportedControls = descriptors.cameraInputTerminal.controls.concat(descriptors.processingUnit.controls)
  }

  getControlParams(id) {
    const control = controls[id]
    if (!control) {
      throw Error('UVC Control identifier not recognized: ' + id)
    }

    const controlType = {
      PU: 'processingUnit',
      CT: 'cameraInputTerminal',
      // VS: 'videoStream',
    } [control.type]
    const unit = this.ids[controlType]
    // const unit = this.ids.processingUnit
    const params = {
      wValue: (control.selector << 8) | 0x00,
      wIndex: (unit << 8) | this.videoControlInterfaceNumber,
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
    const control = this.getControl(id)
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
          fields[field.name] = buffer.readIntLE(field.offset, size)
        })
        resolve(fields)
      })
    })
  }

  getInfo(id) {
    // check if control can actually make the request
    const control = this.getControl(id)
    if (control.requests.indexOf(REQUEST.GET_INFO) === -1) {
      throw Error(`GET_INFO request is not supported for ${id} on this device.`)
    }

    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_INFO, params.wValue, params.wIndex, params.wLength, (error, buffer) => {
        if (error) return reject({
          id,
          error
        })
        const bm = bitmask(buffer.readIntLE(0, buffer.byteLength))
        const info = {
          // D0 Supports GET value requests Capability
          get: Boolean(bm[0]),
          // D1 Supports SET value requests Capability
          set: Boolean(bm[1]),
          // D2 Disabled due to automatic mode (under device control) State
          disabled: Boolean(bm[2]),
          // D3 Autoupdate Control (see section 2.4.2.2 "Status Interrupt Endpoint")
          autoUpdate: Boolean(bm[3]),
          // D4 Asynchronous Control (see sections 2.4.2.2 "Status Interrupt Endpoint" and 2.4.4, “Control Transfer and Request Processing”)
          async: Boolean(bm[3]),
        }
        resolve(info)
      })
    })
  }

  getDefault(id) {
    // check if control can actually make the request
    const control = this.getControl(id)
    if (control.requests.indexOf(REQUEST.GET_DEF) === -1) {
      throw Error(`GET_DEF request is not supported for ${id} on this device.`)
    }

    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_DEF, params.wValue, params.wIndex, params.wLength, (error, buffer) => {
        if (error) return reject({
          id,
          error
        })

        // parse based on fields offset/size
        const fieldDefaults = {}
        control.fields.forEach(field => {
          // NOTE min fixes out of bounds error, but this approach doesn't account for multiple fields...
          let int = buffer.readIntLE(field.offset, Math.min(buffer.byteLength, field.size))
          let result = int
          if (field.type === FIELD_TYPE.BOOLEAN) {
            result = Boolean(int)
          }
          const results = {
            value: result,
          }
          try {
            // FIXME: what do we do with negative numbers in bitmaps??
            // if (field.options && field.type !== 'Bitmap') {
            results.optionKey = Object.entries(field.options).filter(([key, val]) => {
              return val === result
            })[0][0]
            // }
          } catch (e) {}
          fieldDefaults[field.name] = results
        })

        resolve(fieldDefaults)
      })
    })
  }

  getControl(id) {
    const control = controls[id]
    if (!control) throw Error(`No control named ${id}`)
    return control
  }

  /**
   * Set the value of a control
   * @param {string} controlId
   * @param {number} ...values
   */
  set(id, ...values) {
    return new Promise((resolve, reject) => {
      const control = this.getControl(id)
      const params = this.getControlParams(id)
      const data = Buffer.alloc(params.wLength)
      control.fields.forEach((field, i) => {
        data.writeIntLE(values[i], field.offset, field.size)
      })

      this.device.controlTransfer(BM_REQUEST_TYPE.SET, REQUEST.SET_CUR, params.wValue, params.wIndex, data, (err) => {
        if (err) reject(err)
        else resolve(values)
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

    let min
    let max

    const params = this.getControlParams(id)
    const byteLength = control.wLength
    const size = control.fields[0].size

    // TODO promise wrapper for controlTransfer so we can do parallel requests
    return new Promise((resolve, reject) => this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_MIN, params.wValue, params.wIndex, byteLength, (error, buffer) => {
        if (error) return reject(error)
        else {
          min = readInts(buffer, byteLength, size)
          resolve()
        }
      })).then(() => new Promise((resolve, reject) => this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_MAX, params.wValue, params.wIndex, byteLength, (error, buffer) => {
      if (error) return reject(error)
      else {
        max = readInts(buffer, byteLength, size)
        resolve()
      }
    }))).then(() => {
      return {
        min: min,
        max: max,
      }
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
 * Given a USB device, iterate through all of the exposed interfaces looking for the one for VideoControl.
 * @param  {object} device
 * @return {object} interface
 */
function detectVideoControlInterface(device) {
  const {
    interfaces
  } = device
  for (let i = 0; i < interfaces.length; i++) {
    if (interfaces[i].descriptor.bInterfaceClass == CC.VIDEO &&
      interfaces[i].descriptor.bInterfaceSubClass == SC.VIDEOCONTROL
    ) {
      return i
    }
  }
}

/**
 * Check the device descriptor and assert that it is a webcam
 * @param {object} device
 * @return {Boolean}
 */
function isWebcam(device) {
  return device.deviceDescriptor.bDeviceClass === 0xef &&
    device.deviceDescriptor.bDeviceSubClass === 0x02 &&
    device.deviceDescriptor.bDeviceProtocol === 0x01
}

function getInterfaceDescriptors(device) {
  // find the VC interface
  // VC Interface Descriptor is a concatenation of all the descriptors that are used to fully describe
  // the video function, i.e., all Unit Descriptors (UDs) and Terminal Descriptors (TDs)
  const vcInterface = device.interfaces.filter(interface => {
    const {
      descriptor
    } = interface
    return descriptor.bInterfaceClass === CC.VIDEO &&
      descriptor.bInterfaceSubClass === SC.VIDEOCONTROL
  })[0]

  // parse the descriptors in the extra field
  let data = vcInterface.descriptor.extra.toJSON().data
  let descriptorArrays = []
  while (data.length) {
    let bLength = data[0]
    let arr = data.splice(0, bLength)
    descriptorArrays.push(arr)
  }

  // Table 3-6 Camera Terminal Descriptor
  const cameraInputTerminalDescriptor = descriptorArrays.filter(arr => arr[1] === CS.INTERFACE && arr[2] === VC.INPUT_TERMINAL)[0]
  const cITDBuffer = Buffer.from(cameraInputTerminalDescriptor)
  let bControlSize = cITDBuffer.readIntLE(14, 1)
  let bmControls = bitmask(cITDBuffer.readIntLE(15, bControlSize))
  const cameraInputTerminal = {
    bTerminalID: cITDBuffer.readIntLE(3, 1),
    wObjectiveFocalLengthMin: cITDBuffer.readIntLE(8, 2),
    wObjectiveFocalLengthMax: cITDBuffer.readIntLE(10, 2),
    wOcularFocalLength: cITDBuffer.readIntLE(12, 2),
    controls: [
      KEY.scanning_mode,
      KEY.auto_exposure_mode,
      KEY.auto_exposure_priority,
      KEY.absolute_exposure_time,
      KEY.relative_exposure_time,
      KEY.absolute_focus,
      KEY.relative_focus,
      KEY.absolute_iris,
      KEY.relative_iris,
      KEY.absolute_zoom,
      KEY.relative_zoom,
      KEY.absolute_pan_tilt,
      KEY.relative_pan_tilt,
      KEY.absolute_roll,
      KEY.relative_roll,
      undefined,
      undefined,
      KEY.auto_focus,
      KEY.privacy,
    ].filter((name, i) => bmControls[i] && name)
  }

  // Table 3-8 Processing Unit Descriptor
  const processingUnitDescriptor = descriptorArrays.filter(arr => arr[1] === CS.INTERFACE && arr[2] === VC.PROCESSING_UNIT)[0]
  const pUDBuffer = Buffer.from(processingUnitDescriptor)
  bControlSize = pUDBuffer.readIntLE(7, 1)
  bmControls = bitmask(pUDBuffer.readIntLE(8, bControlSize))
  const bmVideoStandards = bitmask(pUDBuffer.readIntLE(8 + bControlSize, 1))
  const processingUnit = {
    bUnitID: pUDBuffer.readIntLE(3, 1),
    wMaxMultiplier: pUDBuffer.readIntLE(3, 1),
    controls: [
      KEY.brightness,
      KEY.contrast,
      KEY.hue,
      KEY.saturation,
      KEY.sharpness,
      KEY.gamma,
      KEY.white_balance_temperature,
      KEY.white_balance_component,
      KEY.backlight_compensation,
      KEY.gain,
      KEY.power_line_frequency,
      KEY.auto_hue,
      KEY.auto_white_balance_temperature,
      KEY.auto_white_balance_component,
      KEY.digital_multiplier,
      KEY.digital_multiplier_limit,
      KEY.analog_video_standard,
      KEY.analog_lock_status,
    ].filter((name, i) => bmControls[i]),
    videoStandards: [
      KEY.NONE,
      KEY.NTSC_525_60,
      KEY.PAL_625_50,
      KEY.SECAM_625_50,
      KEY.NTSC_625_50,
      KEY.PAL_525_60,
    ].filter((name, i) => bmVideoStandards[i])
  }

  // console.log('cameraInputTerminal', cameraInputTerminal)
  // console.log('processingUnit', processingUnit)

  /*
    3.9.2.1 Input Header Descriptor
    The Input Header descriptor is used for VS interfaces that contain an IN endpoint for streaming
    video data. It provides information on the number of different format descriptors that will follow
    it, as well as the total size of all class-specific descriptors in alternate setting zero of this interface.
  */
  // const rawInputHeaderDescriptor = descriptorArrays.filter(arr => arr[1] === CS.INTERFACE && arr[2] === VS_DESCRIPTOR_SUBTYPE.INPUT_HEADER)[0]
  // const inputHeaderDescriptor = {
  //   bEndpointAddress: rawInputHeaderDescriptor[6],
  //   bTerminalLink: rawInputHeaderDescriptor[8],
  //   bStillCaptureMethod: rawInputHeaderDescriptor[9],
  // }

  return {
    processingUnit,
    cameraInputTerminal,
  }
}

const bitmask = (int) => int.toString(2).split('').reverse().map(i => parseInt(i))

function readInts(buffer, length, fieldSize) {
  if((length%fieldSize)!==0) throw new Error("Not equal-sized fields.");
  var output=[];
  for (var i=0;i<length/fieldSize;i++) {
    output.push(readInt(Buffer.concat([buffer, Buffer.alloc((i+1)*fieldSize)]).slice(i*fieldSize, (i+1)*fieldSize), fieldSize));
  }
  if (output.length === 1) {
    return output[0];
  }
  return output;
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

module.exports = UVCControl
