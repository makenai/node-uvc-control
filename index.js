const usb = require('usb')
const {
  SC,
  CC,
  // VS,
  VC,
  CS,
  // VS_DESCRIPTOR_SUBTYPE,
  BM_REQUEST_TYPE,
  REQUEST
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
      CT: 'inputTerminal',
      // VS: 'videoStream',
    } [control.type]
    const unit = this.ids[controlType]
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
          resolve({
            min: min.readIntLE(0, params.wLength),
            max: max.readIntLE(0, params.wLength)
          })
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
      'scanning_mode',
      'auto_exposure_mode',
      'auto_exposure_priority',
      'absolute_exposure_time',
      'relative_exposure_time',
      'absolute_focus',
      'relative_focus',
      'absolute_iris',
      'relative_iris',
      'absolute_zoom',
      'relative_zoom',
      'absolute_pan_tilt',
      'relative_pan_tilt',
      'absolute_roll',
      'relative_roll',
      undefined,
      undefined,
      'auto_focus',
      'privacy',
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
      'brightness',
      'contrast',
      'hue',
      'saturation',
      'sharpness',
      'gamma',
      'white_balance_temperature',
      'white_balance_component',
      'backlight_compensation',
      'gain',
      'power_line_frequency',
      'auto_hue',
      'auto_white_balance_temperature',
      'auto_white_balance_component',
      'digital_multiplier',
      'digital_multiplier_limit',
      'analog_video_standard',
      'analog_lock_status',
    ].filter((name, i) => bmControls[i] && name),
    videoStandards: [
      'NONE',
      'NTSC_525_60',
      'PAL_625_50',
      'SECAM_625_50',
      'NTSC_625_50',
      'PAL_525_60',
    ].filter((name, i) => bmVideoStandards[i])
  }

  console.log('cameraInputTerminal', cameraInputTerminal)
  console.log('processingUnit', processingUnit)

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

module.exports = UVCControl
