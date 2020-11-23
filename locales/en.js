export default {
  layout: {
    buttons: {
      toggleNavigation: {
        title: 'Toggle navigation',
      },
    },
  },
  meta: {
    groups: {
      list: {
        title: 'Devices groups',
      },
      detail: {
        title: 'Group: {group}',
      },
      create: {
        title: 'Add new group',
      },
    },
    devices: {
      list: {
        title: 'Registered devices',
      },
      detail: {
        title: 'Device: {device}',
      },
      connect: {
        title: 'Connect new device',
      },
    },
    triggers: {
      list: {
        title: 'Configured triggers',
      },
      detail: {
        title: 'trigger: {trigger}',
      },
      create: {
        title: 'Add new trigger',
      },
    },
  },
  application: {
    headings: {
      offlineState: 'No internet connection',
    },
    buttons: {
      menu: {
        title: 'Menu',
      },
      new: {
        title: 'New',
      },
      edit: {
        title: 'Edit',
      },
      remove: {
        title: 'Remove',
      },
      save: {
        title: 'Save',
      },
      done: {
        title: 'Done',
      },
      close: {
        title: 'Close',
      },
      cancel: {
        title: 'Cancel',
      },
      yes: {
        title: 'Yes',
      },
      no: {
        title: 'No',
      },
      back: {
        title: 'Back',
      },
      next: {
        title: 'Next',
      },
      add: {
        title: 'Add',
      },
      update: {
        title: 'Update',
      },
      groups: {
        title: 'Groups',
      },
      reset: {
        title: 'Reset',
      },
      rename: {
        title: 'Rename',
      },
      configure: {
        title: 'Configure',
      },
    },
    tabs: {
      home: {
        title: 'Home',
      },
      devices: {
        title: 'Devices',
      },
      triggers: {
        title: 'Triggers',
      },
      groups: {
        title: 'Groups',
      },
    },
    messages: {
      requestError: 'Something went wrong, please try again later.',
      unknownError: 'Something went wrong, please try reload app.',
      valueIsNotValid: 'This value is not valid.',
      loadingApp: 'Application is loading...',
      offlineState: 'It looks like you have no internet connection. Application need internet connection to be able to communicate with services. Try to go online please.',
    },
    menu: {
      root: 'IO server',
      dashboard: 'Dashboard',
      devices: 'Devices',
      triggers: 'Triggers',
      administration: 'Administration',
      users: 'Users',
      access: 'Access rights',
      roles: 'Roles',
      permissions: 'Permissions',
      user: 'Your account',
    },
    userMenu: {
      accountSettings: 'Account settings',
      accountProfile: 'Profile settings',
      passwordChange: 'Password change',
      securitySettings: 'Security settings',
      signOut: 'Sign out',
    },
    states: {
      actual: 'Actual',
      on: 'On',
      off: 'Off',
      notAvailable: 'N/A',
    },
    days: {
      mon: {
        short: 'Mon',
        long: 'Monday',
      },
      tue: {
        short: 'Tue',
        long: 'Tuesday',
      },
      wed: {
        short: 'Wed',
        long: 'Wednesday',
      },
      thu: {
        short: 'Thu',
        long: 'Thursday',
      },
      fri: {
        short: 'Fri',
        long: 'Friday',
      },
      sat: {
        short: 'Sat',
        long: 'Saturday',
      },
      sun: {
        short: 'Sun',
        long: 'Sunday',
      },
    },
    misc: {
      or: 'or',
      paging: '{page} of {total}',
    },
  },
  account: {
    headings: {
      signIn: 'Sign in',
      signUp: 'Sign up',
      passwordReset: 'Request password reset',
      instructionEmailed: 'We emailed you a instructions...',
      accountSettings: 'Account settings',
      profileSettings: 'Profile settings',
      securitySettings: 'Security settings',
      passwordChange: 'Password change',
    },
    messages: {
      passwordRequestFail: 'Password reset instruction couldn\'t be send.',
      accountNotEdited: 'Your account couldn\'t be edited.',
      emailNotEdited: 'Your email address couldn\'t be changed.',
      passwordNotEdited: 'Your password couldn\'t be changed.',
    },
    texts: {
      resetPasswordInfo: 'Provide your primary email address or your username and we will send you details with special link to reset your password.',
      resetPasswordInstructionsEmailed: 'It should be there momentarily. Please check your email and click the link in the message. After one hour, the link to update your password will expire.',
      processing: 'Processing request...',
    },
    fields: {
      identity: {
        uid: {
          title: 'Primary email or username',
          validation: {
            required: 'Please fill in your primary email or username',
          },
        },
        password: {
          title: 'Password',
          validation: {
            required: 'Please fill in your password',
          },
        },
      },
      persistent: {
        title: 'Keep me signed in',
      },
      emailAddress: {
        title: 'Email',
        help: 'Email address, eg. john@doe.com',
        validation: {
          required: 'Please fill in your email address',
        },
      },
      firstName: {
        title: 'First name',
        help: 'First name, eg. John',
        validation: {
          required: 'Please fill in first name',
        },
      },
      lastName: {
        title: 'Last name',
        help: 'Last name, eg. Doe',
        validation: {
          required: 'Please fill in last name',
        },
      },
      middleName: {
        title: 'Middle name',
      },
      language: {
        title: 'Language',
      },
      datetime: {
        timezone: {
          title: 'Time zone',
        },
        dateFormat: {
          title: 'Date format',
        },
        timeFormat: {
          title: 'Time format',
        },
        weekStartOn: {
          title: 'Week start on',
          values: {
            monday: 'Monday',
            saturday: 'Saturday',
            sunday: 'Sunday',
          },
        },
      },
      password: {
        current: {
          title: 'Current password',
          help: 'Your actual password',
          validation: {
            required: 'Please fill in your current password',
          },
        },
        new: {
          title: 'New password',
          help: 'Your new password',
          validation: {
            required: 'Please fill in your new password',
          },
        },
        repeat: {
          title: 'Repeat new password',
          help: 'Confirm your new password',
          validation: {
            required: 'Please repeat your new password',
          },
        },
      },
    },
    buttons: {
      signIn: {
        title: 'Sign in',
      },
      signUp: {
        title: 'Sign up',
      },
      forgotPassword: {
        title: 'Forgot password?',
        tooltip: 'If you forget your password, just recover it.',
      },
      resetPassword: {
        title: 'Request password reset',
      },
    },
  },
  groups: {
    headings: {
      remove: 'Remove group',
      rename: 'Rename group',
      generalSettings: 'General settings',
    },
    messages: {
      notFound: 'Group was not found, please try reload page.',
      notCreated: 'Group {group} couldn\'t be created, please try again later.',
      confirmRemove: 'Are you sure to remove group {group} ?',
      notRemoved: 'Group {group} couldn\'t be removed, please try again later.',
      notEdited: 'Group {group} couldn\'t be renamed, please try again later.',
    },
    texts: {
      loadingGroups: 'Loading groups...',
      loadingGroup: 'Loading group...',
      noGroups: 'You don\'t have created any group',
      noDevices: 'This group is without assigned devices',
    },
    fields: {
      title: {
        title: 'Give group a name',
        validation: {
          required: 'Please fill in group name',
        },
      },
      comment: {
        title: 'Describe your group',
      },
    },
    buttons: {
      remove: {
        title: 'Remove group',
      },
      rename: {
        title: 'Rename group',
      },
      addNew: {
        title: 'Add new group',
      },
    },
  },
  devices: {
    headings: {
      allDevices: 'All devices',
      channel: 'Channel: {channel}',
      channels: 'Device channels',
      renameDevice: 'Rename device',
      renameChannel: 'Rename channel',
      resetChannel: 'Reset channel',
      removeDevice: 'Remove device',
      credentials: 'Connection credentials',
      deviceSettings: 'Device settings',
      channelSettings: 'Channel settings',
      moduleSensorSettings: 'Device sensor settings',
      moduleTimeSettings: 'Device time settings',
      generalSettings: 'General settings',
      deviceParameterEdit: 'Device parameter settings',
      channelParameterEdit: 'Channel parameter settings',
      connectDevice: 'Connect new device',
      syncDevices: 'Sync devices',
      aboutDevice: 'About device',
      deviceBasicInfo: 'Device basic info',
      connectionToServer: 'Connection to server',
      accessCredentials: 'Access credentials',
      processingDevice: 'Processing',
      finished: 'Finished',
    },
    subHeadings: {
      allDevices: 'No devices registered | One device registered | {count} devices registered',
      connectDevice: 'Register new device to the system',
      syncDevices: 'Sync all devices with server',

      deviceBasicInfo: 'Describe your new device',
      connectionToServer: 'How device will communicate with server',
      accessCredentials: 'Device server access credentials',
      processingDevice: 'Finalizing device configuration',
      finished: 'Your new device could be now connected',
    },
    messages: {
      notOnline: 'Device {device} is not connected to server.',
      commandNotAccepted: 'Last command was not accepted by device {device}.',
      notSupported: 'This function is not supported by {device}.',
      confirmResetChannel: 'Clear measured values for device {device} and channel {channel} ?',
      deviceNotRenamed: 'Device {device} couldn\'t be renamed.',
      channelNotRenamed: 'Channel {channel} couldn\'t be renamed.',
      confirmRemoveDevice: 'Are you sure to remove device {device} ?',
      deviceNotRemoved: 'Device {device} couldn\'t be removed.',
      deviceNotEdited: 'Device {device} couldn\'t be updated.',
      parameterNotUpdated: 'Parameter {parameter} couldn\'t be updated.',
      moduleNotUpdated: 'Module for device {device} couldn\'t be updated.',
      calibrationFailed: 'Calibration for device {device} failed.',
      deviceNotAdded: 'Something went wrong. Device could not be registered.',
      credentialsNotUpdated: 'Credentials for device {device} couldn\'t be updated.',
    },
    texts: {
      loadingDevices: 'Loading devices...',
      loadingDevice: 'Loading device...',
      notFound: 'Device was not found, please try reload page',
      noDevices: 'You don\'t have assigned any device',
      noChannels: 'This device is without channels',
      noProperties: 'This channel is without properties',
      deviceBasicInfo: 'Provide basic information about your new device to identify it in the system',
      connectionToServer: 'Choose one from listed options how your new device will be connected to the server',
      accessCredentials: 'Provide device server access credentials',
      processingDevice: 'Your new device is now going to be registered on server',
      finished: 'Your new device is now allowed to connect to the server',
      registeringDevice: 'Registering device...',
      grantingAccess: 'Granting access to the server...',
      registeringDeviceError: 'Something went wrong, device could not be registered',
      waitingForDevice: 'Waiting for the device to connect to the server...',
    },
    fields: {
      deviceName: {
        title: 'Device name',
        placeholder: 'Enter device name',
        validation: {
          required: 'Please fill in device name',
        },
      },
      deviceComment: {
        title: 'Device description',
        placeholder: 'Enter device description',
      },
      identifier: {
        title: 'Device identifier',
        validation: {
          required: 'Please fill in device unique identifier',
        },
      },
      username: {
        title: 'Username',
        placeholder: 'Enter device username',
        validation: {
          required: 'Please fill in device communication username',
        },
      },
      password: {
        title: 'Password',
        placeholder: 'Enter device password',
        validation: {
          required: 'Please fill in device communication password',
        },
      },
      clientId: {
        title: 'Client ID',
      },
      mqtt: {
        server: {
          title: 'MQTT address',
        },
        port: {
          title: 'MQTT port',
        },
        securedServer: {
          title: 'MQTT secured address',
        },
        securedPort: {
          title: 'MQTT secured port',
        },
      },
      search: {
        title: 'Search devices',
        placeholder: 'Search for device',
      },
      channelName: {
        title: 'Channel name',
        placeholder: 'Enter channel name',
        validation: {
          required: 'Please fill in channel name',
        },
      },
      channelComment: {
        title: 'Channel description',
        placeholder: 'Enter channel description',
      },
    },
    buttons: {
      addNew: {
        title: 'Connect new device',
      },
      addTypeMqtt: {
        title: 'MQTT',
      },
      addTypeUdp: {
        title: 'UDP packets',
      },
      addTypeSigfox: {
        title: 'Sigfox',
      },
      addTypeLora: {
        title: 'LoRa',
      },
      credentials: {
        title: 'Connection credentials',
      },
      sensorConfiguration: {
        title: 'Sensor settings',
        description: 'Configure device sensors etc.',
      },
      timeConfiguration: {
        title: 'Time settings',
        description: 'Configure device timezone etc.',
      },
      energyCalibration: {
        title: 'Calibrate energy',
      },
      renameDevice: {
        title: 'Rename device',
      },
      renameChannel: {
        title: 'Rename channel',
      },
      removeDevice: {
        title: 'Remove device',
      },
      sync: {
        title: 'Synchronise',
      },
    },
    vendors: {
      fastybird: {
        devices: {
          fastybird_wifi_gw: {
            title: 'FastyBird WiFi Gateway',
          },
          fastybird_3ch_power_strip_r1: {
            title: 'FastyBird Smart Power Strip',
            channels: {
              'socket-one': 'Socket 1',
              'socket-two': 'Socket 2',
              'socket-three': 'Socket 3',
            },
          },
          '8ch_buttons': {
            title: 'FastyBird 8CH Buttons',
          },
          '16ch_buttons': {
            title: 'FastyBird 16CH Buttons',
            channels: {
              event: 'Button {number}',
            },
          },
        },
        actions: {
          toggle: 'Toggle {property} state',
          on: 'Turn {property} on',
          off: 'Turn {property} off',
        },
        properties: {
        },
        configuration: {
          led_mode: {
            button: 'Status indicator mode',
            heading: 'Status indicator mode',
            description: 'Define how the device status indicator should operate. Indicator could be turned off to not disturb you.',
            values: {
              wifi_status: 'Wifi status',
              always_on: 'Always on',
              always_off: 'Always off',
            },
          },
          relays_sync: {
            button: 'Switch synchronization',
            heading: 'Switch sync mode',
            description: 'Define how the different switches should be synchronized.',
            values: {
              disabled: 'Disabled',
              zero_or_one: 'Zero or one active',
              only_one: 'Only one active',
              all_synchronized: 'All synchronized',
            },
          },
          btn_delay: {
            button: 'Double click delay',
            heading: 'Double click delay',
            description: 'Delay in milliseconds to detect a double click (from 0 to 1000ms).',
          },
        },
      },
      itead: {
        devices: {
          sonoff_basic: {
            title: 'Sonoff Smart Switch',
            channels: {
              output: 'Output',
            },
          },
          sonoff_s20: {
            title: 'Sonoff Smart Socket',
            channels: {
              socket: 'Wall Socket',
            },
          },
          sonoff_sc: {
            title: 'Sonoff Environent Unit',
            channels: {
              environment: 'Environment',
            },
          },
          sonoff_pow: {
            title: 'Sonoff Power Metter',
            channels: {
              energy: 'Energy',
            },
          },
        },
        actions: {
          toggle: 'Toggle {property} state',
          on: 'Turn {property} on',
          off: 'Turn {property} off',
        },
        properties: {
          switch: {
            title: 'Switch',
          },
          button: {
            title: 'Button',
          },
          power: {
            title: 'Active power',
          },
          current: {
            title: 'Current',
          },
          voltage: {
            title: 'Voltage',
          },
          apparent: {
            title: 'Apparent power',
          },
          reactive: {
            title: 'Reactive power',
          },
          factor: {
            title: 'Power factor',
          },
          energy: {
            title: 'Energy',
          },
          energy_delta: {
            title: 'Energy (delta)',
          },
          temperature: {
            title: 'Temperature',
          },
          humidity: {
            title: 'Humidity',
          },
          air_quality: {
            title: 'Air quality',
            values: {
              unhealthy: 'Unhealthy',
              moderate: 'Moderate',
              good: 'Good',
            },
          },
          light_level: {
            title: 'Light level',
            values: {
              dusky: 'Dusky',
              normal: 'Normal',
              bright: 'Bright',
            },
          },
          noise_level: {
            title: 'Noise level',
            values: {
              noisy: 'noisy',
              normal: 'Normal',
              quiet: 'Quiet',
            },
          },
        },
        configuration: {
          led_mode: {
            button: 'Status indicator mode',
            heading: 'Status indicator mode',
            description: 'Define how the device status indicator should operate. Indicator could be turned off to not disturb you.',
            values: {
              wifi_status: 'Wifi status',
              always_on: 'Always on',
              always_off: 'Always off',
            },
          },
          relays_sync: {
            button: 'Switch synchronization',
            heading: 'Switch sync mode',
            description: 'Define how the different switches should be synchronized.',
            values: {
              disabled: 'Disabled',
              zero_or_one: 'Zero or one active',
              only_one: 'Only one active',
              all_synchronized: 'All synchronized',
            },
          },
          btn_delay: {
            button: 'Double click delay',
            heading: 'Double click delay',
            description: 'Delay in milliseconds to detect a double click (from 0 to 1000ms).',
          },
          ntp_offset: {
            button: 'Time zone',
            heading: 'Time zone',
            description: 'Define time zone offset in minutes from GMT',
          },
          ntp_server: {
            button: 'NTP server',
            heading: 'NTP server',
            description: 'Define server for time synchronization',
          },
          ntp_region: {
            button: 'DST region',
            heading: 'DST region',
            values: {
              europe: 'Europe',
              usa: 'USA',
            },
          },
          ntp_dst: {
            button: 'Enable DST',
            heading: 'Enable DST',
          },
          on_disconnect: {
            button: 'On disconnect',
            heading: 'On disconnect',
            description: 'State of switch after connection loss to broker',
            values: {
              no_change: 'No change',
              turn_off: 'Turn off',
              turn_on: 'Turn on',
            },
          },
          pulse_mode: {
            button: 'Pulse mode',
            heading: 'Pulse mode',
            values: {
              disabled: 'Disabled',
              normally_off: 'Normally off',
              normally_on: 'Normally on',
            },
          },
          pulse_time: {
            button: 'Pulse time',
            heading: 'Pulse time (s)',
            description: '',
          },
          relay_boot: {
            button: 'Boot mode',
            heading: 'Boot mode',
            description: 'State of switch after boot up',
            values: {
              always_off: 'Always off',
              always_on: 'Always on',
              same_before: 'Same before',
              toggle_before: 'Toggle before',
            },
          },
          sensor_read_interval: {
            button: 'Sensors reading interval',
            heading: 'Sensors reading interval',
            description: 'Select the interval between readings. These will be filtered and averaged for the report',
            values: {
              1: '1 s',
              6: '6 s',
              10: '10 s',
              15: '15 s',
              30: '30 s',
              60: '60 s',
              300: '5 min',
              600: '10 min',
              900: '15 min',
              1800: '30 min',
              3600: '60 min',
            },
          },
          sensor_report_interval: {
            button: 'Sensors report every',
            heading: 'Sensors report every',
            description: 'Select the number of readings to average and report',
          },
          sensor_save_interval: {
            button: 'Sensors save every',
            heading: 'Sensors save every',
            description: 'Save aggregated data to device memory after these many reports. Set it to 0 to disable this feature',
          },
          sensor_power_units: {
            button: 'Power unit',
            heading: 'Power unit',
            values: {
              watts: 'Watts (W)',
              kilowatts: 'Kilowatts (kW)',
            },
          },
          sensor_energy_units: {
            button: 'Energy unit',
            heading: 'Energy unit',
            values: {
              joules: 'Joules (J)',
              kilowatts_hours: 'Kilowatts-hours (kWh)',
            },
          },
          sensor_energy_ration: {
            button: 'Energy ratio',
            heading: 'Energy ratio',
            description: 'Energy ratio in pulses/kWh.',
          },
          sensor_expected_current: {
            button: 'Expected current',
            heading: 'Expected current',
            description: 'In Amperes (A). If you are using a pure resistive load like a bulb, this will be the ratio between the two previous values, i.e. power / voltage. You can also use a current clamp around one of the power wires to get this value.',
          },
          sensor_expected_voltage: {
            button: 'Expected voltage',
            heading: 'Expected voltage',
            description: 'In Volts (V). Enter your the nominal AC voltage for your household or facility, or use multimeter to get this value.',
          },
          sensor_expected_power: {
            button: 'Expected power',
            heading: 'Expected power',
            description: 'In Watts (W). Calibrate your sensor connecting a pure resistive load (like a bulb) and enter here its nominal power or use a multimeter.',
          },
          actions: {
            toggle: 'Toggle {property} state',
            on: 'Turn {property} on',
            off: 'Turn {property} off',
          },
        },
      },
    },
  },
  triggers: {
    headings: {
      allTriggers: 'All triggers',
      addNewTrigger: 'Create new trigger',
      conditions: 'When:',
      actions: 'Accessories:',
      scheduledDate: 'When...',
      scheduledTime: 'When...',
      aboutTrigger: 'About trigger',
      generalSettings: 'Trigger settings',
      renameTrigger: 'Rename trigger',
      removeTrigger: 'Remove trigger',
      typeActor: 'Available actors',
      typeSensor: 'Available sensors',
      typeDevice: 'Available devices',
      typeTime: 'Time based condition',
      typeDate: 'Date based condition',
      addNewCondition: 'Add new condition',
      removeCondition: 'Remove condition',
      removeAction: 'Remove action',
      triggerType: 'Choose trigger type',
      createTrigger: 'Create new trigger',
      createTimeScheduledTrigger: 'Create new time based trigger',
      createDateScheduledTrigger: 'Create new date based trigger',
      createDeviceTrigger: 'Create new device controlled trigger',
      createSensorTrigger: 'Create new sensor controlled trigger',
      createManualTrigger: 'Create new manual trigger',
      selectDevice: 'Select device to be assigned',
      syncTriggers: 'Sync triggers',
      automaticTrigger: 'Automatic trigger',
      manualTrigger: 'Manual trigger',
      scheduledTrigger: '{days}, {time}',
      configureDate: 'Configure condition date',
      configureTime: 'Configure condition time',
    },
    subHeadings: {
      allTriggers: 'No triggers created | One trigger created | {count} triggers created',
      addNewTrigger: 'Create new automation or manual trigger',
      syncTriggers: 'Sync all triggers with server',
      createDateScheduledTrigger: 'Date scheduled',
      createTimeScheduledTrigger: 'Time scheduled',
      createDeviceControlTrigger: 'Device watchdog',
      createSensorTrigger: 'Sensors watchdog',
      createManualTrigger: 'Manually controlled',
      selectDevice: 'Choose one from devices bellow',
      configureDate: 'Select date & time',
      configureTime: 'Select time and days of the week',
    },
    messages: {
      triggerNotRenamed: 'Trigger {trigger} couldn\'t be renamed.',
      triggerNotRemoved: 'Trigger {trigger} couldn\'t be removed.',
      conditionNotCreated: 'Condition for trigger {trigger} couldn\'t be added.',
      conditionNotUpdated: 'Condition for trigger {trigger} couldn\'t be updated.',
      conditionNotRemoved: 'Condition for trigger {trigger} couldn\'t be removed.',
      actionNotCreated: 'Action for trigger {trigger} couldn\'t be added.',
      actionNotUpdated: 'Action for trigger {trigger} couldn\'t be updated.',
      actionNotRemoved: 'Action for trigger {trigger} couldn\'t be removed.',
      confirmRemoveTrigger: 'Are you sure to remove trigger {trigger} ?',
      confirmRemoveCondition: 'Are you sure to remove trigger condition ?',
      confirmRemoveAction: 'Are you sure to remove trigger action ?',
      atLeastOneConditionProperty: 'You have to select at least one property.',
      atLeastOneActionProperty: 'You have to select at least one property.',
    },
    texts: {
      loadingTriggers: 'Loading triggers...',
      loadingTrigger: 'Loading trigger...',
      noTriggers: 'You don\'t have created any trigger',
      loadingDevices: 'Loading devices...',
      loadingDevice: 'Loading device...',
      noDevices: 'You don\'t have assigned any device',
      noConditions: 'No conditions are assigned to this trigger',
      noActions: 'No accessories are assigned to this trigger',
      noNotifications: 'No notifications are assigned to this trigger',
      scheduledTime: 'Scheduled for time: {time}',
      scheduledDate: 'Scheduled: {date} {time}',
      everyday: 'Everyday',
    },
    fields: {
      search: {
        title: 'Search',
        placeholder: 'Search for triggers',
      },
      triggerName: {
        title: 'Give trigger a name:',
        placeholder: 'Rise n\' Shine',
        validation: {
          required: 'Please fill in trigger name',
        },
      },
      triggerComment: {
        title: 'Describe your trigger:',
        placeholder: 'Short trigger description for better identification',
      },
      conditionDate: {
        title: 'When:',
      },
      conditionTime: {
        title: 'When:',
      },
      conditionRepeat: {
        title: 'Repeat:',
      },
    },
    buttons: {
      addNew: {
        title: 'Add new trigger',
      },
      sync: {
        title: 'Synchronise triggers',
      },
      triggerEnabled: {
        title: 'Trigger is enabled',
      },
      triggerDisabled: {
        title: 'Trigger is disabled',
      },
      renameTrigger: {
        title: 'Rename trigger',
      },
      removeTrigger: {
        title: 'Remove trigger',
      },
      addTypeTimeOfDay: {
        title: 'A time of day occurs',
      },
      addTypeDate: {
        title: 'A specific day occurs',
      },
      addTypeDeviceControlled: {
        title: 'An device is controlled',
      },
      addTypeSensorDetect: {
        title: 'A sensor detects something',
      },
      addTypeManual: {
        title: 'Custom manual scene',
      },
      addDevice: {
        title: 'Add device',
      },
      addTime: {
        title: 'Add time',
      },
      addDate: {
        title: 'Add date',
      },
      addAccessory: {
        title: 'Add accessory',
      },
    },
    actions: {
      toggle: 'Toggle {property} state',
      on: 'Turn {property} on',
      off: 'Turn {property} off',
    },
    conditions: {
      above: '{property} value is above {value}',
      eq: '{property} value is equal to {value}',
      below: '{property} value is below {value}',
    },
  },
}
