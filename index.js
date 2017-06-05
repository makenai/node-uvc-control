var usb = require('usb');

var UVC_SET_CUR = 0x01;
var UVC_GET_CUR = 0x81;
var UVC_GET_MIN	= 0x82;
var UVC_GET_MAX	= 0x83;
var UVC_INPUT_TERMINAL_ID = 0x01;
var UVC_PROCESSING_UNIT_ID = 0x03;

// See USB Device Class Definition for Video Devices Revision 1.1
// http://www.usb.org/developers/docs/devclass_docs/
// Specifically:
// - 4.2 VideoControl Requests
// - A.9. Control Selector Codes

var Controls = {
  // ==============
  // Input Terminal
  // ==============
  autoExposureMode: { // TODO - needs constants
    // D0: Manual Mode – manual Exposure Time, manual Iris
    // D1: Auto Mode – auto Exposure Time, auto Iris
    // D2: Shutter Priority Mode – manual Exposure Time, auto Iris
    // D3: Aperture Priority Mode – auto Exposure Time, manual Iris
    // D4..D7: Reserved, set to zero.
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x02,
    size: 1
  },
  autoExposurePriority: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x03,
    size: 1
  },
  absoluteExposureTime: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x04,
    size: 4
  },
  absoluteFocus: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x06,
    size: 2
  },
  absoluteZoom: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x0B,
    size: 2
  },
  absolutePanTilt: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x0D,
    size: 8 // dwPanAbsolute (4 bytes) + dwTiltAbsolute (4 bytes)
  },
  autoFocus: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x08,
    size: 1
  },
  // ===============
  // Processing Unit
  // ===============
  brightness: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x02,
    size: 2
  },
  contrast: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x03,
    size: 2
  },
  saturation: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x07,
    size: 2
  },
  sharpness: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x08,
    size: 2
  },
  whiteBalanceTemperature: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x0A,
    size: 2
  },
  backlightCompensation: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x01,
    size: 2
  },
  gain: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x04,
    size: 2
  },
  autoWhiteBalance: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x0B,
    size: 1
  }
};

function UVCControl(vid, pid, options) {
  this.vid = vid;
  this.pid = pid;
  this.options = options || {};
  this.init();
}
module.exports = UVCControl;

/**
 * Get list of recognized controls
 * @return {Array} controls
 */
UVCControl.controls = Object.keys( Controls );

UVCControl.prototype.init = function() {
  var devices = usb.getDeviceList();
  for (var i=0;i<devices.length;i++) {
    if(this.options['deviceAddress'] === devices[i].deviceAddress) {
      var descr = devices[i].deviceDescriptor;
      if((this.vid === descr.idVendor) && (this.pid === descr.idProduct)) {
        this.device = devices[i];
      }
    }
  }
  if (!this.device) {
    this.device = usb.findByIds( this.vid, this.pid );
  }
  if (this.device) {
    this.device.open();
    this.interfaceNumber = detectVideoControlInterface( this.device );
  }
}

UVCControl.prototype.getUnitOverride = function(unit) {
  if (unit == UVC_INPUT_TERMINAL_ID && this.options.inputTerminalId) {
    return this.options.inputTerminalId;
  }
  if (unit == UVC_PROCESSING_UNIT_ID && this.options.processingUnitId) {
    return this.options.processingUnitId
  }
  return unit;
}

UVCControl.prototype.getControlParams = function(id, callback) {
  if (!this.device) {
    return callback(new Error('USB device not found with vid 0x' + this.vid.toString(16) + ', pid 0x' + this.pid.toString(16) ));
  }
  if (this.interfaceNumber === undefined) {
    return callback(new Error('UVC compliant device not found.'));
  }
  var control = Controls[id];
  if (!control) {
    return callback( new Error('UVC Control identifier not recognized: ' + id) );
  }

  var unit = this.getUnitOverride(control.unit);
  var params = {
    wValue: (control.selector << 8) | 0x00,
    wIndex: (unit << 8) | this.interfaceNumber,
    wLength: control.size
  };
  callback(null, params);
};

/**
 * Close the device
 */
UVCControl.prototype.close = function() {
  this.device.close();
}

/**
 * Get the value of a control
 * @param  {string} controlName
 * @param  {Function} callback(error,value)
 */
UVCControl.prototype.get = function(id, callback) {
  this.getControlParams(id, function(error, params) {
    if (error) return callback(error);
    this.device.controlTransfer(0b10100001, UVC_GET_CUR, params.wValue, params.wIndex, params.wLength, function(error,buffer) {
      if (error) return callback(error);
      callback(null, buffer.readIntLE(0,params.wLength));
    });
  }.bind(this));
}

/**
 * Set the value of a control
 * @param  {string}   controlId
 * @param  {number}   value
 * @param  {Function} callback(error)
 */
UVCControl.prototype.set = function(id, value, callback) {
  this.getControlParams(id, function(error, params) {
    if (error) return callback(error);
    var data = new Buffer(params.wLength);
    data.writeIntLE(value, 0, params.wLength);
    this.device.controlTransfer(0b00100001, UVC_SET_CUR, params.wValue, params.wIndex, data, callback);
  }.bind(this));
}

/**
 * Set the raw value of a control
 * @param  {string}   controlId
 * @param  {buffer}   value
 * @param  {Function} callback(error)
 */
UVCControl.prototype.setRaw = function(id, value, callback) {
  this.getControlParams(id, function(error, params) {
    if (error) return callback(error);
    this.device.controlTransfer(0b00100001, UVC_SET_CUR, params.wValue, params.wIndex, value, callback);
  }.bind(this));
}

/**
 * Get the min and max range of a control
 * @param  {string} controlName
 * @param  {Function} callback(error,minMax)
 */
UVCControl.prototype.range = function(id, callback) {
  this.getControlParams(id, function(error, params) {
    if (error) return callback(error);
    this.device.controlTransfer(0b10100001, UVC_GET_MIN, params.wValue, params.wIndex, params.wLength, function(error,min) {
      if (error) return callback(error);
      this.device.controlTransfer(0b10100001, UVC_GET_MAX, params.wValue, params.wIndex, params.wLength, function(error,max) {
        if (error) return callback(error);
        callback(null,[min.readIntLE(0,params.wLength), max.readIntLE(0,params.wLength)]);
      }.bind(this));
    }.bind(this));
  }.bind(this));
}

/**
 * Given a USB device, iterate through all of the exposed interfaces looking for
 * the one for VideoControl. bInterfaceClass = CC_VIDEO (0x0e) and
 * bInterfaceSubClass = SC_VIDEOCONTROL (0x01)
 * @param  {object} device
 * @return {object} interface
 */
function detectVideoControlInterface(device) {
  var interfaces = device.interfaces;
  for (var i=0;i<interfaces.length;i++) {
    if ( interfaces[i].descriptor.bInterfaceClass == 0x0e &&
      interfaces[i].descriptor.bInterfaceSubClass == 0x01
    ) {
      return i;
    }
  }
}
