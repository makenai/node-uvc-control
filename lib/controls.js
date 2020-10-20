// See USB Device Class Definition for Video Devices Revision 1.1
// http://www.usb.org/developers/docs/devclass_docs/

const {
  FIELD_TYPE,
  REQUEST,
  PU,
  CT,
  VS,
  KEY,
} = require('./constants')

const CONTROLS = {

  // still_image_trigger: {
  //   description: `This control notifies the device to begin sending still-image data over the relevant isochronous or bulk pipe. A dedicated still-image bulk pipe is only used for method 3 of still image capture. This control shall only be set while streaming is occurring, and the hardware shall reset it to the "Normal Operation" mode after the still image has been sent. This control is only required if the device supports method 2 or method 3 of still-image retrieval. See section 2.4.2.4 "Still Image Capture". `,
  //   selector: VS.STILL_IMAGE_TRIGGER_CONTROL,
  //   type: 'CT',
  //   // type: 'VS',
  //   wLength: 1,
  //   requests: [
  //     REQUEST.SET_CUR,
  //     REQUEST.GET_CUR,
  //     REQUEST.GET_INFO,
  //   ],
  //   fields: [{
  //     name: 'bTrigger',
  //     description: 'The setting for the Still Image Trigger Control',
  //     offset: 0,
  //     size: 1,
  //     type: FIELD_TYPE.NUMBER,
  //     options: {
  //       NORMAL: 0,
  //       TRANSMIT: 1,
  //       TRANSMIT_BULK: 2,
  //       ABORT: 3,
  //     }
  //   }]
  // },
  // ==============
  // Input Terminal
  // ==============
  [KEY.auto_exposure_mode]: {
    description: `The Auto-Exposure Mode Control determines whether the device will provide automatic adjustment of the Exposure Time and Iris controls. Attempts to programmatically set the autoadjusted controls are then ignored. A GET_RES request issued to this control will return a bitmap of the modes supported by this control. A valid request to this control would have only one bit set (a single mode selected). This control must accept the GET_DEF request and return its default value.`,
    selector: CT.AE_MODE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bAutoExposureMode',
      description: 'The setting for the attribute of the addressed Auto-Exposure Mode Control',
      offset: 0,
      size: 1,
      type: FIELD_TYPE.BITMAP,
      options: {
        MANUAL: 0b00000001,
        AUTO: 0b00000010,
        PRIORITY_SHUTTER: 0b00000100,
        PRIORITY_APERTURE: 0b00001000,
      }
    }]
  },
  [KEY.auto_exposure_priority]: {
    description: 'The Auto-Exposure Priority Control is used to specify constraints on the Exposure Time Control when the Auto-Exposure Mode Control is set to Auto Mode or Shutter Priority Mode. A value of zero indicates that the frame rate must remain constant. A value of 1 indicates that the frame rate may be dynamically varied by the device. The default value is zero (0).',
    selector: CT.AE_PRIORITY_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bAutoExposurePriority',
      description: 'The setting for the attribute of the addressed AutoExposure Priority control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
    }]
  },
  [KEY.absolute_exposure_time]: {
    description: 'The Exposure Time (Absolute) Control is used to specify the length of exposure. This value is expressed in 100µs units, where 1 is 1/10,000th of a second, 10,000 is 1 second, and 100,000 is 10 seconds. A value of zero (0) is undefined. Note that the manual exposure control is further limited by the frame interval, which always has higher precedence. If the frame interval is changed to a value below the current value of the Exposure Control, the Exposure Control value will automatically be changed. The default Exposure Control value will be the current frame interval until an explicit exposure value is chosen. This control will not accept SET requests when the Auto-Exposure Mode control is in Auto mode or Aperture Priority mode, and the control pipe shall indicate a stall in this case. This control must accept the GET_DEF request and return its default value.',
    selector: CT.EXPOSURE_TIME_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 4,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'dwExposureTimeAbsolute',
      description: 'The setting for the attribute of the addressed Exposure Time (Absolute) Control. 0: Reserved, 1: 0.0001 sec, 100000: 10 sec',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 4,
    }]
  },
  [KEY.absolute_focus]: {
    description: 'The Focus (Absolute) Control is used to specify the distance to the optimally focused target. This value is expressed in millimeters. The default value is implementation-specific. This control must accept the GET_DEF request and return its default value.',
    selector: CT.FOCUS_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wFocusAbsolute',
      description: 'The setting for the attribute of the addressed Focus (Absolute) Control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.absolute_zoom]: {
    description: 'The Zoom (Absolute) Control is used to specify or determine the Objective lens focal length. This control is used in combination with the wObjectiveFocalLengthMin and wObjectiveFocalLengthMax fields in the Camera Terminal descriptor to describe and control the Objective lens focal length of the device(see section 2.4.2.5.1 "Optical Zoom"). The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: CT.ZOOM_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wObjectiveFocalLength',
      description: 'The value of Zcur(see section 2.4.2.5.1 "Optical Zoom".)',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.absolute_pan_tilt]: {
    description: 'The PanTilt (Absolute) Control is used to specify the pan and tilt settings. The dwPanAbsolute is used to specify the pan setting in arc second units. 1 arc second is 1/3600 of a degree. Values range from –180*3600 arc second to +180*3600 arc second, or a subset thereof, with the default set to zero. Positive values are clockwise from the origin (the camera rotates clockwise when viewed from above), and negative values are counterclockwise from the origin. This control must accept the GET_DEF request and return its default value. The dwTiltAbsolute Control is used to specify the tilt setting in arc second units. 1 arc second is 1/3600 of a degree. Values range from –180*3600 arc second to +180*3600 arc second, or a subset thereof, with the default set to zero. Positive values point the imaging plane up, and negative values point the imaging plane down. This control must accept the GET_DEF request and return its default value.',
    selector: CT.PANTILT_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 8,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'dwPanAbsolute',
      description: 'The setting for the attribute of the addressed Pan (Absolute) Control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 4,
    }, {
      name: 'dwTiltAbsolute',
      description: 'The setting for the attribute of the addressed Tilt (Absolute) Control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 4,
      size: 4,
    }],
  },
  [KEY.auto_focus]: {
    description: 'The Focus, Auto Control setting determines whether the device will provide automatic adjustment of the Focus Absolute and/or Relative Controls. A value of 1 indicates that automatic adjustment is enabled. Attempts to programmatically set the related controls are then ignored. This control must accept the GET_DEF request and return its default value.',
    selector: CT.FOCUS_AUTO_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bFocusAuto',
      description: 'The setting for the attribute of the addressed Focus Auto control.',
      type: FIELD_TYPE.BOOLEAN,
      offset: 0,
      size: 1,
    }],
  },

  [KEY.scanning_mode]: {
    description: 'The Scanning Mode Control setting is used to control the scanning mode of the camera sensor. A value of 0 indicates that the interlace mode is enabled, and a value of 1 indicates that the progressive or the non-interlace mode is enabled.',
    selector: CT.SCANNING_MODE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bScanningMode',
      description: 'The setting for the attribute of the addressed Scanning Mode Control',
      type: FIELD_TYPE.BOOLEAN,
      offset: 0,
      size: 1,
      options: {
        INTERLACED: 0,
        PROGRESSIVE: 1,
      }
    }],
  },
  [KEY.relative_exposure_time]: {
    description: 'The Exposure Time (Relative) Control is used to specify the electronic shutter speed. This value is expressed in number of steps of exposure time that is incremented or decremented. A value of one (1) indicates that the exposure time is incremented one step further, and a value 0xFF indicates that the exposure time is decremented one step further. This step is implementation specific. A value of zero (0) indicates that the exposure time is set to the default value for implementation. The default values are implementation specific. This control will not accept SET requests when the Auto-Exposure Mode control is in Auto mode or Aperture Priority mode, and the control pipe shall indicate a stall in this case. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control (see section 2.4.2.2, “Status Interrupt Endpoint”).',
    selector: CT.EXPOSURE_TIME_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bExposureTimeRelative',
      description: 'The setting for the attribute of the addressed Exposure Time (Relative) Control',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 1,
      options: {
        DEFAULT: 0,
        INCREASE: 1,
        DECREASE: 0xFF,
      }
    }],
  },
  [KEY.relative_focus]: {
    description: 'The Focus (Relative) Control is used to move the focus lens group to specify the distance to the optimally focused target. The bFocusRelative field indicates whether the focus lens group is stopped or is moving for near or for infinity direction. A value of 1 indicates that the focus lens group is moved for near direction. A value of 0 indicates that the focus lens group is stopped. And a value of 0xFF indicates that the lens group is moved for infinity direction. The GET_MIN, GET_MAX, GET_RES and GET_DEF requests will return zero for this field. The bSpeed field indicates the speed of the lens group movement. A low number indicates a slow speed and a high number indicates a high speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control, it will return the value 1 in this field for all these requests. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control at the end of the movement (see section 2.4.2.2, “Status Interrupt Endpoint”). The end of movement can be due to physical device limits, or due to an explicit request by the host to stop the movement. If the end of movement is due to physical device limits (such as a limit in range of motion), a Control Change interrupt shall be generated for this Relative Control. If there is no limit in range of motion, a Control Change interrupt is not required.',
    selector: CT.FOCUS_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bFocusRelative',
      description: 'The setting for the attribute of the addressed Focus (Relative) Control',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 1,
      options: {
        STOP: 0,
        DIRECTION_NEAR: 1,
        DIRECTION_INFINITE: 0xFF,
      }
    }, {
      name: 'bSpeed',
      description: 'Speed for the control change',
      type: FIELD_TYPE.NUMBER,
      offset: 1,
      size: 1,
    }],
  },
  [KEY.absolute_iris]: {
    description: `The Iris (Absolute) Control is used to specify the camera's aperture setting. This value is expressed in units of fstop * 100. The default value is implementation-specific. This control will not accept SET requests when the Auto-Exposure Mode control is in Auto mode or Shutter Priority mode, and the control pipe shall indicate a stall in this case. This control must accept the GET_DEF request and return its default value.`,
    selector: CT.IRIS_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wIrisAbsolute',
      description: 'The setting for the attribute of the addressed Iris (Absolute) Control.',
      offset: 0,
      size: 2,
      type: FIELD_TYPE.NUMBER,
    }],
  },
  [KEY.relative_iris]: {
    description: `The Iris (Relative) Control is used to specify the camera's aperture setting. This value is a signed integer and indicates the number of steps to open or close the iris. A value of 1 indicates that the iris is opened 1 step further. A value of 0xFF indicates that the iris is closed 1 step further. This step of iris is implementation specific. A value of zero (0) indicates that the iris is set to the default value for the implementation. The default value is implementation specific. This control will not accept SET requests when the Auto-Exposure Mode control is in Auto mode or Shutter Priority mode, and the control pipe shall indicate a stall in this case. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control (see section 2.4.2.2, “Status Interrupt Endpoint”). Table 4-18 Iris`,
    selector: CT.IRIS_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bIrisRelative',
      description: 'The setting for the attribute of the addressed Iris (Relative) Control',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
      options: {
        DEFAULT: 0,
        INCREASE: 1,
        DECREASE: 0xFF,
      }
    }],
  },
  [KEY.relative_zoom]: {
    description: 'The Zoom (Relative) Control is used to specify the zoom focal length relatively as powered zoom. The bZoom field indicates whether the zoom lens group is stopped or the direction of the zoom lens. A value of 1 indicates that the zoom lens is moved towards the telephoto direction. A value of zero indicates that the zoom lens is stopped, and a value of 0xFF indicates that the zoom lens is moved towards the wide-angle direction. The GET_MIN, GET_MAX, GET_RES and GET_DEF requests will return zero for this field. The bDigitalZoom field specifies whether digital zoom is enabled or disabled. If the device only supports digital zoom, this field would be ignored. The GET_DEF request will return the default value for this field. The GET_MIN, GET_MAX and GET_RES requests will return zero for this field. The bSpeed field indicates the speed of the control change. A low number indicates a slow speed and a high number indicates a higher speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control, it will return the value 1 in this field for all these requests. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control at the end of the movement (see section 2.4.2.2, “Status Interrupt Endpoint”). The end of movement can be due to physical device limits, or due to an explicit request by the host to stop the movement. If the end of movement is due to physical device limits (such as a limit in range of motion), a Control Change interrupt shall be generated for this Relative Control.',
    selector: CT.ZOOM_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 3,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
        name: 'bZoom',
        description: 'The setting for the attribute of the addressed Zoom Control',
        type: FIELD_TYPE.NUMBER, // Signed number
        offset: 0,
        size: 1,
        options: {
          STOP: 0,
          DIRECTION_TELEPHOTO: 1,
          DIRECTION_WIDE_ANGLE: 0xFF,
        }
      },
      {
        name: 'bDigitalZoom',
        offset: 1,
        size: 1,
        type: FIELD_TYPE.BOOLEAN,
        options: {
          OFF: 0,
          ON: 1,
        }
      }, {
        name: 'bSpeed',
        description: 'Speed for the control change',
        type: FIELD_TYPE.NUMBER,
        offset: 2,
        size: 1,
      }
    ],
  },
  [KEY.relative_pan_tilt]: {
    description: 'The PanTilt (Relative) Control is used to specify the pan and tilt direction to move. The bPanRelative field is used to specify the pan direction to move. A value of 0 indicates to stop the pan, a value of 1 indicates to start moving clockwise direction, and a value of 0xFF indicates to start moving counterclockwise direction. The GET_DEF, GET_MIN, GET_MAX and GET_RES requests will return zero for this field. The bPanSpeed field is used to specify the speed of the movement for the Pan direction. A low number indicates a slow speed and a high number indicates a higher speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control for the Pan control, it will return the value 1 in this field for all these requests. The bTiltRelative field is used to specify the tilt direction to move. A value of zero indicates to stop the tilt, a value of 1 indicates that the camera point the imaging plane up, and a value of 0xFF indicates that the camera point the imaging plane down. The GET_DEF, GET_MIN, GET_MAX and GET_RES requests will return zero for this field. The bTiltSpeed field is used to specify the speed of the movement for the Tilt direction. A low number indicates a slow speed and a high number indicates a higher speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control for the Tilt control, it will return the value 1 in this field for all these requests. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control at the end of the movement (see section 2.4.2.2, “Status Interrupt Endpoint”). The end of movement can be due to physical device limits, or due to an explicit request by the host to stop the movement. If the end of movement is due to physical device limits (such as a limit in range of motion), a Control Change interrupt shall be generated for this Relative Control. If there is no limit in range of motion, a Control Change interrupt is not required.',
    selector: CT.PANTILT_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 4,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bPanRelative',
      description: 'The setting for the attribute of the addressed Pan(Relative) Control',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 1,
      options: {
        STOP: 0,
        CLOCKWISE: 1,
        COUNTER_CLOCKWISE: 0xFF,
      }
    }, {
      name: 'bPanSpeed',
      description: 'Speed of the Pan movement',
      type: FIELD_TYPE.NUMBER,
      offset: 1,
      size: 1,
    }, {
      name: 'bTiltRelative',
      description: 'The setting for the attribute of the addressed Tilt(Relative) Control',
      offset: 2,
      size: 1,
      type: FIELD_TYPE.NUMBER, // Signed Number
      options: {
        STOP: 0,
        UP: 1,
        DOWN: 0xFF,
      }
    }, {
      name: 'bTiltSpeed',
      description: 'Speed for the Tilt movement',
      type: FIELD_TYPE.NUMBER,
      offset: 3,
      size: 1,
    }],
  },
  [KEY.absolute_roll]: {
    description: 'The Roll (Absolute) Control is used to specify the roll setting in degrees. Values range from – 180 to +180, or a subset thereof, with the default being set to zero. Positive values cause a clockwise rotation of the camera along the image viewing axis, and negative values cause a counterclockwise rotation of the camera. This control must accept the GET_DEF request and return its default value.',
    selector: CT.ROLL_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wRollAbsolute',
      description: 'The setting for the attribute of the addressed Roll (Absolute) Control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 2,
    }],
  },
  [KEY.relative_roll]: {
    description: 'The Roll (Relative) Control is used to specify the roll direction to move. The bRollRelative field is used to specify the roll direction to move. A value of 0 indicates to stop the roll, a value of 1 indicates to start moving in a clockwise rotation of the camera along the image viewing axis, and a value of 0xFF indicates to start moving in a counterclockwise direction. The GET_DEF, GET_MIN, GET_MAX and GET_RES requests will return zero for this field. The bSpeed is used to specify the speed of the roll movement. A low number indicates a slow speed and a high number indicates a higher speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control, it will return the value 1 in this field for all these requests. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control at the end of the movement (see section 2.4.2.2, “Status Interrupt Endpoint”). The end of movement can be due to physical device limits, or due to an explicit request by the host to stop the movement. If the end of movement is due to physical device limits (such as a limit in range of motion), a Control Change interrupt shall be generated for this Relative Control. If there is no limit in range of motion, a Control Change interrupt is not required.',
    selector: CT.ROLL_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bRollRelative',
      description: 'The setting for the attribute of the addressed Roll (Relative) Control',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 1,
      options: {
        STOP: 0,
        CLOCKWISE: 1,
        COUNTER_CLOCKWISE: 0xFF,
      }
    }, {
      name: 'bSpeed',
      description: 'Speed for the Roll movement',
      offset: 1,
      size: 1,
      type: FIELD_TYPE.NUMBER,
    }],
  },
  [KEY.privacy]: {
    description: 'The Privacy Control setting is used to prevent video from being acquired by the camera sensor. A value of 0 indicates that the camera sensor is able to capture video images, and a value of 1 indicates that the camera sensor is prevented from capturing video images. This control shall be reported as an AutoUpdate control.',
    selector: CT.PRIVACY_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'bPrivacy',
      description: 'The setting for the attribute of the addressed Privacy Control',
      type: FIELD_TYPE.BOOLEAN,
      offset: 0,
      size: 1,
      options: {
        OPEN: 0,
        CLOSE: 1,
      }
    }],
  },

  // ===============
  // Processing Unit
  // ===============
  [KEY.power_line_frequency]: {
    description: 'This control allows the host software to specify the local power line frequency, in order for the device to properly implement anti-flicker processing, if supported. The default is implementation-specific. This control must accept the GET_DEF request and return its default value.',
    selector: PU.POWER_LINE_FREQUENCY_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bPowerLineFrequency',
      description: 'The setting for the attribute of the addressed Power Line Frequency control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
      options: {
        DISABLED: 0,
        HZ_50: 1,
        HZ_60: 2,
      }
    }],
  },
  [KEY.hue]: {
    description: 'This is used to specify the hue setting. The value of the hue setting is expressed in degrees multiplied by 100. The required range must be a subset of -18000 to 18000 (-180 to +180 degrees). The default value must be zero. This control must accept the GET_DEF request and return its default value.',
    selector: PU.HUE_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wHue',
      description: 'The setting for the attribute of the addressed Hue control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 2,
    }],
  },
  [KEY.white_balance_component]: {
    description: 'This is used to specify the white balance setting as Blue and Red values for video formats. This is offered as an alternative to the White Balance Temperature control. The supported range and default value for white balance components is implementation-dependent. The device shall interpret the controls as blue and red pairs. This control must accept the GET_DEF request and return its default value.',
    selector: PU.WHITE_BALANCE_COMPONENT_CONTROL,
    type: 'PU',
    wLength: 4,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wWhiteBalanceBlue',
      description: 'The setting for the blue component of the addressed White Balance Component control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }, {
      name: 'wWhiteBalanceRed',
      description: 'The setting for the red component of the addressed White Balance Component control.',
      type: FIELD_TYPE.NUMBER,
      offset: 1,
      size: 2,
    }],
  },
  [KEY.auto_white_balance_component]: {
    description: 'The White Balance Component Auto Control setting determines whether the device will provide automatic adjustment of the related control. A value of 1 indicates that automatic adjustment is enabled. Attempts to programmatically set the related control are then ignored. This control must accept the GET_DEF request and return its default value.',
    selector: PU.WHITE_BALANCE_COMPONENT_AUTO_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bWhiteBalanceComponentAuto',
      description: 'The setting for the attribute of the addressed White Balance Component, Auto control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
    }],
  },
  [KEY.digital_multiplier]: {
    description: 'This is used to specify the amount of Digital Zoom applied to the optical image. This is the position within the range of possible values of multiplier m, allowing the multiplier resolution to be described by the device implementation. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. If the Digital Multiplier Limit Control is supported, the MIN and MAX values shall match the MIN and MAX values of the Digital Multiplier Control. The Digital Multiplier Limit Control allows either the Device or the Host to establish a temporary upper limit for the Z′cur value, thus reducing dynamically the range of the Digital Multiplier Control. If Digital Multiplier Limit is used to decrease the Limit below the current Z′cur value, the Z′cur value will be adjusted to match the new limit and the Digital Multiplier Control shall send a Control Change Event to notify the host of the adjustment.',
    selector: PU.DIGITAL_MULTIPLIER_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wMultiplierStep',
      description: 'The value Z′cur (see section 2.4.2.5.2 "Digital Zoom".)',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.digital_multiplier_limit]: {
    description: 'This is used to specify an upper limit for the amount of Digital Zoom applied to the optical image. This is the maximum position within the range of possible values of multiplier m. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent.',
    selector: PU.DIGITAL_MULTIPLIER_LIMIT_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wMultiplierLimit',
      description: 'A value specifying the upper bound for Z′cur (see section 2.4.2.5.2 "Digital Zoom".)',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.auto_hue]: {
    description: 'The Hue Auto Control setting determines whether the device will provide automatic adjustment of the related control. A value of 1 indicates that automatic adjustment is enabled. Attempts to programmatically set the related control are then ignored. This control must accept the GET_DEF request and return its default value.',
    selector: PU.HUE_AUTO_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bHueAuto',
      description: 'The setting for the attribute of the addressed Hue, Auto control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
    }],
  },
  [KEY.analog_video_standard]: {
    description: 'This is used to report the current Video Standard of the stream captured by the Processing Unit. ',
    selector: PU.ANALOG_VIDEO_STANDARD_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bVideoStandard',
      description: 'The Analog Video Standard of the input video signal.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
      options: {
        NONE: 0,
        NTSC_525_60: 1,
        PAL_625_50: 2,
        SECAM_625_50: 3,
        NTSC_625_50: 4,
        PAL_525_60: 5,
      }
    }],
  },
  [KEY.analog_lock_status]: {
    description: 'This is used to report whether the video decoder has achieved horizontal lock of the analog input signal. If the decoder is locked, it is assumed that a valid video stream is being generated. This control is to be supported only for analog video decoder functionality.',
    selector: PU.ANALOG_LOCK_STATUS_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bStatus',
      description: 'Lock status',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
      options: {
        LOCKED: 0,
        UNLOCKED: 1,
      }
    }],
  },
  [KEY.brightness]: {
    description: 'This is used to specify the brightness. This is a relative value where increasing values indicate increasing brightness. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.BRIGHTNESS_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wBrightness',
      description: 'The setting for the attribute of the addressed Brightness control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 2,
    }],
  },
  [KEY.contrast]: {
    description: 'This is used to specify the contrast value. This is a relative value where increasing values indicate increasing contrast. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.CONTRAST_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wContrast',
      description: 'The setting for the attribute of the addressed Contrast control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.gain]: {
    description: 'This is used to specify the gain setting. This is a relative value where increasing values indicate increasing gain. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.GAIN_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wGain',
      description: 'The setting for the attribute of the addressed Gain control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.saturation]: {
    description: 'This is used to specify the saturation setting. This is a relative value where increasing values indicate increasing saturation. A Saturation value of 0 indicates grayscale. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation-dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.SATURATION_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wSaturation',
      description: 'The setting for the attribute of the addressed Saturation control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.sharpness]: {
    description: 'This is used to specify the sharpness setting. This is a relative value where increasing values indicate increasing sharpness, and the MIN value always implies "no sharpness processing", where the device will not process the video image to sharpen edges. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation-dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.SHARPNESS_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wSharpness',
      description: 'The setting for the attribute of the addressed Sharpness control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.white_balance_temperature]: {
    description: 'This is used to specify the white balance setting as a color temperature in degrees Kelvin. This is offered as an alternative to the White Balance Component control. Minimum range should be 2800 (incandescent) to 6500 (daylight) for webcams and dual-mode cameras. The supported range and default value for white balance temperature is implementation-dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.WHITE_BALANCE_TEMPERATURE_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR
    ],
    fields: [{
      name: 'wWhiteBalanceTemperature',
      description: 'The setting for the attribute of the addressed White Balance Temperature control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.backlight_compensation]: {
    description: 'The Backlight Compensation Control is used to specify the backlight compensation. A value of zero indicates that the backlight compensation is disabled. A non-zero value indicates that the backlight compensation is enabled. The device may support a range of values, or simply a binary switch. If a range is supported, a low number indicates the least amount of backlightcompensation. The default value is implementation-specific, but enabling backlight compensation is recommended. This control must accept the GET_DEF request and return its default value.',
    selector: PU.BACKLIGHT_COMPENSATION_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wBacklightCompensation',
      description: 'The setting for the attribute of the addressed Backlight Compensation control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.gain]: {
    description: 'This is used to specify the gain setting. This is a relative value where increasing values indicate increasing gain. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.GAIN_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wGain',
      description: 'The setting for the attribute of the addressed Gain control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.auto_white_balance_temperature]: {
    description: 'The White Balance Temperature Auto Control setting determines whether the device will provide automatic adjustment of the related control. A value of 1 indicates that automatic adjustment is enabled. Attempts to programmatically set the related control are then ignored. This control must accept the GET_DEF request and return its default value.',
    selector: PU.WHITE_BALANCE_TEMPERATURE_AUTO_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bWhiteBalanceTemperatureAuto',
      description: 'The setting for the attribute of the addressed White Balance Temperature, Auto control.',
      type: FIELD_TYPE.BOOLEAN,
      offset: 0,
      size: 1,
    }],
  },
  [KEY.gamma]: {
    description: 'This is used to specify the gamma setting. The value of the gamma setting is expressed in gamma multiplied by 100. The required range must be a subset of 1 to 500, and the default values are typically 100 (gamma = 1) or 220 (gamma = 2.2). This control must accept the GET_DEF request and return its default value',
    selector: PU.GAMMA_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wGamma',
      description: 'The setting for the attribute of the addressed Gamma control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
}

Object.entries(CONTROLS).forEach(([key, control]) => control.name = key)

module.exports = CONTROLS
