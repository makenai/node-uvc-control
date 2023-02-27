const {usb} = require("usb")

const KEY = {
  scanning_mode: 'scanning_mode',
  auto_exposure_mode: 'auto_exposure_mode',
  auto_exposure_priority: 'auto_exposure_priority',
  absolute_exposure_time: 'absolute_exposure_time',
  relative_exposure_time: 'relative_exposure_time',
  absolute_focus: 'absolute_focus',
  relative_focus: 'relative_focus',
  absolute_iris: 'absolute_iris',
  relative_iris: 'relative_iris',
  absolute_zoom: 'absolute_zoom',
  relative_zoom: 'relative_zoom',
  absolute_pan_tilt: 'absolute_pan_tilt',
  relative_pan_tilt: 'relative_pan_tilt',
  absolute_roll: 'absolute_roll',
  relative_roll: 'relative_roll',
  auto_focus: 'auto_focus',
  privacy: 'privacy',
  brightness: 'brightness',
  contrast: 'contrast',
  hue: 'hue',
  saturation: 'saturation',
  sharpness: 'sharpness',
  gamma: 'gamma',
  white_balance_temperature: 'white_balance_temperature',
  white_balance_component: 'white_balance_component',
  backlight_compensation: 'backlight_compensation',
  gain: 'gain',
  power_line_frequency: 'power_line_frequency',
  auto_hue: 'auto_hue',
  auto_white_balance_temperature: 'auto_white_balance_temperature',
  auto_white_balance_component: 'auto_white_balance_component',
  digital_multiplier: 'digital_multiplier',
  digital_multiplier_limit: 'digital_multiplier_limit',
  analog_video_standard: 'analog_video_standard',
  analog_lock_status: 'analog_lock_status',
  NONE: 'NONE',
  NTSC_525_60: 'NTSC_525_60',
  PAL_625_50: 'PAL_625_50',
  SECAM_625_50: 'SECAM_625_50',
  NTSC_625_50: 'NTSC_625_50',
  PAL_525_60: 'PAL_525_60',
}

const FIELD_TYPE = {
  BOOLEAN: 'BOOLEAN',
  BITMAP: 'BITMAP',
  NUMBER: 'NUMBER',
}

const BM_REQUEST_TYPE = {
  GET: usb.LIBUSB_REQUEST_TYPE_CLASS | usb.LIBUSB_RECIPIENT_DEVICE | usb.LIBUSB_ENDPOINT_IN,
  SET: usb.LIBUSB_REQUEST_TYPE_CLASS | usb.LIBUSB_RECIPIENT_DEVICE | usb.LIBUSB_ENDPOINT_OUT,
}

const CS = {
  UNDEFINED: 0x20,
  DEVICE: 0x21,
  CONFIGURATION: 0x22,
  STRING: 0x23,
  INTERFACE: 0x24,
  ENDPOINT: 0x25,
}

const REQUEST = {
  RC_UNDEFINED: 0x00,
  SET_CUR: 0x01,
  GET_CUR: 0x81,
  GET_MIN: 0x82,
  GET_MAX: 0x83,
  GET_RES: 0x84,
  GET_LEN: 0x85,
  GET_INFO: 0x86,
  GET_DEF: 0x87,
}

const VS = {
  UNDEFINED: 0x00,
  PROBE_CONTROL: 0x01,
  COMMIT_CONTROL: 0x02,
  STILL_PROBE_CONTROL: 0x03,
  STILL_COMMIT_CONTROL: 0x04,
  STILL_IMAGE_TRIGGER_CONTROL: 0x05,
  STREAM_ERROR_CODE_CONTROL: 0x06,
  GENERATE_KEY_FRAME_CONTROL: 0x07,
  UPDATE_FRAME_SEGMENT_CONTROL: 0x08,
  SYNCH_DELAY_CONTROL: 0x09,
}

// A.6. Video Class-Specific VS Interface Descriptor Subtypes
const VS_DESCRIPTOR_SUBTYPE = {
  UNDEFINED: 0x00,
  INPUT_HEADER: 0x01,
  OUTPUT_HEADER: 0x02,
  STILL_IMAGE_FRAME: 0x03,
  FORMAT_UNCOMPRESSED: 0x04,
  FRAME_UNCOMPRESSED: 0x05,
  FORMAT_MJPEG: 0x06,
  FRAME_MJPEG: 0x07,
  FORMAT_MPEG2TS: 0x0A,
  FORMAT_DV: 0x0C,
  COLORFORMAT: 0x0D,
  FORMAT_FRAME_BASED: 0x10,
  FRAME_FRAME_BASED: 0x11,
  FORMAT_STREAM_BASED: 0x12,
}

const PU = {
  CONTROL_UNDEFINED: 0x00,
  BACKLIGHT_COMPENSATION_CONTROL: 0x01,
  BRIGHTNESS_CONTROL: 0x02,
  CONTRAST_CONTROL: 0x03,
  GAIN_CONTROL: 0x04,
  POWER_LINE_FREQUENCY_CONTROL: 0x05,
  HUE_CONTROL: 0x06,
  SATURATION_CONTROL: 0x07,
  SHARPNESS_CONTROL: 0x08,
  GAMMA_CONTROL: 0x09,
  WHITE_BALANCE_TEMPERATURE_CONTROL: 0x0A,
  WHITE_BALANCE_TEMPERATURE_AUTO_CONTROL: 0x0B,
  WHITE_BALANCE_COMPONENT_CONTROL: 0x0C,
  WHITE_BALANCE_COMPONENT_AUTO_CONTROL: 0x0D,
  DIGITAL_MULTIPLIER_CONTROL: 0x0E,
  DIGITAL_MULTIPLIER_LIMIT_CONTROL: 0x0F,
  HUE_AUTO_CONTROL: 0x10,
  ANALOG_VIDEO_STANDARD_CONTROL: 0x11,
  ANALOG_LOCK_STATUS_CONTROL: 0x12,
}

const CT = {
  CONTROL_UNDEFINED: 0x00,
  SCANNING_MODE_CONTROL: 0x01,
  AE_MODE_CONTROL: 0x02,
  AE_PRIORITY_CONTROL: 0x03,
  EXPOSURE_TIME_ABSOLUTE_CONTROL: 0x04,
  EXPOSURE_TIME_RELATIVE_CONTROL: 0x05,
  FOCUS_ABSOLUTE_CONTROL: 0x06,
  FOCUS_RELATIVE_CONTROL: 0x07,
  FOCUS_AUTO_CONTROL: 0x08,
  IRIS_ABSOLUTE_CONTROL: 0x09,
  IRIS_RELATIVE_CONTROL: 0x0A,
  ZOOM_ABSOLUTE_CONTROL: 0x0B,
  ZOOM_RELATIVE_CONTROL: 0x0C,
  PANTILT_ABSOLUTE_CONTROL: 0x0D,
  PANTILT_RELATIVE_CONTROL: 0x0E,
  ROLL_ABSOLUTE_CONTROL: 0x0F,
  ROLL_RELATIVE_CONTROL: 0x10,
  PRIVACY_CONTROL: 0x11,
}

const VC = {
  DESCRIPTOR_UNDEFINED: 0x00,
  HEADER: 0x01,
  INPUT_TERMINAL: 0x02,
  OUTPUT_TERMINAL: 0x03,
  SELECTOR_UNIT: 0x04,
  PROCESSING_UNIT: 0x05,
  EXTENSION_UNIT: 0x06,
}

const CC = {
  VIDEO: 0x0e,
}

const EP = {
  UNDEFINED: 0x00,
  GENERAL: 0x01,
  ENDPOINT: 0x02,
  INTERRUPT: 0x03,
}

const SC = {
  UNDEFINED: 0x00,
  VIDEOCONTROL: 0x01,
  VIDEOSTREAMING: 0x02,
  VIDEO_INTERFACE_COLLECTION: 0x03,
}

module.exports = {
  EP,
  SC,
  CC,
  VC,
  CT,
  CS,
  PU,
  VS,
  KEY,
  REQUEST,
  BM_REQUEST_TYPE,
  VS_DESCRIPTOR_SUBTYPE,
  FIELD_TYPE,
}
