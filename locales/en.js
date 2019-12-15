export default {
  layout: {
    projectName: 'FastyBird.com',
    buttons: {
      toggleNavigation: {
        title: 'Toggle navigation',
      },
    },
  },
  meta: {
    groups: {
      list: {
        title: 'Things groups',
      },
      detail: {
        title: 'Group: {group}',
      },
      create: {
        title: 'Add new group',
      },
    },
    things: {
      list: {
        title: 'Registered things',
      },
      detail: {
        title: 'Thing: {thing}',
      },
      routines: {
        title: 'Thing routines: {thing}',
      },
    },
    routines: {
      list: {
        title: 'Configured routines',
      },
      detail: {
        title: 'Routine: {routine}',
      },
      create: {
        title: 'Add new routine',
      },
    },
  },
  application: {
    headings: {
      offlineState: 'No internet connection',
      things: {
        list: 'All things',
      },
      groups: {
        list: 'All groups',
        add: 'New group',
      },
      routines: {
        list: 'All routines',
        add: 'New routine',
      },
    },
    subHeadings: {
      things: {
        list: 'no things | one thing | {count} tings',
      },
      groups: {
        list: 'no groups | one group | {count} groups',
      },
      routines: {
        list: 'no routines | one routine | {count} routines',
      },
    },
    buttons: {
      edit: {
        title: 'Edit',
      },
      remove: {
        title: 'Remove',
      },
      save: {
        title: 'Save',
      },
      close: {
        title: 'Close',
      },
      yes: {
        title: 'Yes',
      },
      no: {
        title: 'No',
      },
      back: {
        title: 'Go back',
      },
      settings: {
        title: 'Settings',
      },
      previous: {
        title: 'Previous',
      },
      next: {
        title: 'Next',
      },
      cancel: {
        title: 'Cancel',
      },
      add: {
        title: 'Add',
      },
      routines: {
        title: 'Routines',
      },
      favouriteAdd: {
        title: 'Add to favourite',
      },
      things: {
        title: 'Things',
      },
      groups: {
        title: 'Groups',
      },
      connect: {
        title: 'Connect thing',
      },
      automation: {
        title: 'Automation',
      },
      schedules: {
        title: 'Schedules',
      },
    },
    tabs: {
      home: {
        title: 'Home',
      },
      things: {
        title: 'Things',
      },
      routines: {
        title: 'Routines',
      },
    },
    messages: {
      requestError: 'Something went wrong, please try again later.',
      fixAllFormErrors: 'Please fix all marked form errors.',
      valueIsNotValid: 'This value is not valid.',
      loadingApp: 'Application is loading...',
      offlineState: 'It looks like you have no internet connection. Application need internet connection to be able to communicate with services. Try to go online please.',
    },
    menu: {
      root: 'Cloud',
      home: 'Home',
      things: 'Things',
      routines: 'Routines',
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
  },
  home: {
    buttons: {
      things: {
        title: 'Things',
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
      created: 'Group {group} was successfully created.',
      notCreated: 'Group {group} couldn\'t be created, please try again later.',
      confirmRemove: 'Are you sure to remove group {group} ?',
      removed: 'Group {group} was successfully removed.',
      notRemoved: 'Group {group} couldn\'t be removed, please try again later.',
      edited: 'Group {group} was successfully renamed.',
      notEdited: 'Group {group} couldn\'t be renamed, please try again later.',
    },
    texts: {
      loadingGroups: 'Loading groups...',
      loadingGroup: 'Loading group...',
      noGroups: 'You don\'t have created any group',
      noThings: 'This group is without assigned things',
    },
    fields: {
      title: {
        title: 'Give group a name',
        validation: {
          required: 'Please fill in group name.',
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
    },
  },
  things: {
    headings: {
      analogSensors: 'Analog sensor|Analog sensors',
      analogActors: 'Analog actor|Analog actors',
      binaryActors: 'Digital actor|Digital actors',
      binarySensors: 'Digital sensor|Digital sensors',
      energy: 'Energy',
      environment: 'Environment',
      lights: 'Light|Lights',
      switches: 'Switch|Switches',
      calibrate: 'Calibrate energy sensors',
      clearCounter: 'Clear counter',
      credentials: 'Thing MQTT credentials',
      remove: 'Remove thing',
      rename: 'Rename thing',
      thingSettings: 'Thing settings',
      generalSettings: 'General settings',
      moduleSensorSettings: 'Thing sensor settings',
      moduleTimeSettings: 'Thing time settings',
      manufacturerAndNetwork: 'Manufacturer & Network info',
    },
    messages: {
      edited: 'Thing {thing} was successfully edited.',
      notEdited: 'Thing {thing} couldn\'t be updated, please try again later.',
      notFound: 'Thing was not found, please try reload page.',
      commandNotAccepted: 'Last command was not accepted by thing <strong>{thing}</strong>.',
      notOnline: 'Thing <strong>{thing}</strong> is not connected to cloud.',
      notSupported: 'This function is not supported by <strong>{thing}</strong>.',
      confirmClearCounter: 'Clear total consumption counter for thing {thing} ?',
      confirmRemove: 'Are you sure to remove thing {thing} ?',
      removed: 'Thing {thing} was successfully removed.',
      notRemoved: 'Thing {thing} couldn\'t be removed, please try again later.',
      renamed: 'Thing {thing} was successfully renamed.',
      notRenamed: 'Thing {thing} couldn\'t be renamed, please try again later.',
    },
    texts: {
      loadingThings: 'Loading things...',
      loadingThing: 'Loading thing...',
      noThings: 'You don\'t have assigned any thing',
      noProperties: 'This thing is without controllable properties',
      notFound: 'Thing was not found, please try reload page.',
      wifi: {
        name: 'Wifi name',
        ip: 'IP address',
      },
      hardware: {
        model: 'Model',
        manufacturer: 'Manufacturer',
      },
    },
    buttons: {
      remove: {
        title: 'Remove thing',
      },
      rename: {
        title: 'Rename thing',
      },
      credentials: {
        title: 'Connection credentials',
      },
      timeConfiguration: {
        title: 'Time settings',
        description: 'Configure thing timezone etc.',
      },
      sensorConfiguration: {
        title: 'Sensor settings',
        description: 'Configure thing sensors etc.',
      },
      energyCalibration: {
        title: 'Calibrate energy',
      },
    },
    vendors: {
      global: {
        title: {
          title: 'Thing name',
          validation: {
            required: 'Please fill in thing name.',
          },
        },
        comment: {
          title: 'Thing description',
        },
        username: {
          title: 'Thing MQTT username',
          validation: {
            required: 'Please fill in your thing username.',
          },
        },
        password: {
          title: 'Thing MQTT password',
          validation: {
            required: 'Please fill in your thing password.',
          },
        },
        mqttServer: {
          title: 'MQTT server address',
        },
        mqttPort: {
          title: 'MQTT server port',
        },
      },
      fastybird: {
        things: {
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
      },
      itead: {
        things: {
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
        led_mode: {
          button: 'Status indicator mode',
          heading: 'Status indicator mode',
          description: 'Define how the thing status indicator should operate. Indicator could be turned off to not disturb you.',
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
          description: 'Save aggregated data to thing memory after these many reports. Set it to 0 to disable this feature',
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
      },
    },
  },
  routines: {
    headings: {
      selectThing: 'Things',
      smsNotification: 'Send sms to',
      emailNotification: 'Send email to',
      conditions: 'Watching for states...',
      actions: '...and performing actions',
      rename: 'Rename routine',
      refresh: 'Refresh routine',
      remove: 'Remove routine',
      generalSettings: 'General settings',
      addCondition: 'Add a thing condition to this routine?',
      addAction: 'Add a thing action to this routine?',
      automaticRoutine: 'Automatic routine',
      manualRoutine: 'Manual routine',
    },
    messages: {
      notFound: 'Routine was not found, please try reload page.',
      selectPropertyAction: 'Please select at least one property to control',
      selectPropertyCondition: 'Please select at least one property to watch',
      fillOperand: 'Please fill operand value for channel \'{channel}\' and property \'{property}\'',
      missingCondition: 'You have to add at least one condition.',
      missingActionOrNotification: 'You have to add at least one action or notification.',
      notCreated: 'Routine {routine} couldn\'t be created, please try again later.',
      conditionNotAdded: 'Condition couldn\'t be added into routine, please try again later.',
      conditionNotRemoved: 'Condition couldn\'t be removed from routine, please try again later.',
      conditionNotCreated: 'Condition couldn\'t be added to routine, please try again later.',
      conditionNotUpdated: 'Condition couldn\'t be updated, please try again later.',
      minimumConditions: 'Routine have to have at least one condition.',
      actionNotAdded: 'Action couldn\'t be added into routine, please try again later.',
      actionNotRemoved: 'Action couldn\'t be removed from routine, please try again later.',
      actionNotCreated: 'Action couldn\'t be added to routine, please try again later.',
      actionNotUpdated: 'Action couldn\'t be updated, please try again later.',
      notificationNotAdded: 'Notification couldn\'t be added into the routine, please try again later.',
      notificationNotRemoved: 'Notification couldn\'t be removed from routine, please try again later.',
      minimumActionsNotification: 'Routine have to have at least one action or notification.',
      confirmRefresh: 'Received new details for routine {routine}. Do you want to refresh it ?',
      notRefreshed: 'Routine {routine} couldn\'t be refreshed, please try reload page.',
      confirmRemove: 'Are you sure to remove routine {routine} ?',
      notRemoved: 'Routine {routine} couldn\'t be removed, please try again later.',
      notEdited: 'Routine {routine} couldn\'t be updated, please try again later.',
    },
    texts: {
      loadingRoutines: 'Loading routines...',
      loadingRoutine: 'Loading routine...',
      noRoutines: 'You don\'t have created any routine',
      loadingThings: 'Loading things...',
      loadingThing: 'Loading thing...',
      noThings: 'You don\'t have assigned any thing',
      routineThings: 'no things | {count} thing | {count} tings',
    },
    fields: {
      name: {
        title: 'Give routine a name',
        validation: {
          required: 'Please fill in routine name',
        },
      },
      comment: {
        title: 'Describe your routine',
      },
      type: {
        title: 'Notification type',
        prompt: '-- Please select type --',
        values: {
          sms: 'Send SMS',
          email: 'Send e-mail',
        },
        validation: {
          required: 'Selecting notification type is required.',
        },
      },
      sms: {
        title: 'SMS number',
        validation: {
          required: 'Please fill in mobile phone number.',
        },
      },
      value: {
        values: {
          sms: 'SMS number',
          email: 'E-mail address',
        },
        validation: {
          required: 'This field is required.',
          invalidAddress: 'This e-mail address is invalid.',
        },
      },
      email: {
        title: 'E-mail address',
        prompt: '-- Please select e-mail --',
        validation: {
          required: 'You have to select saved e-mail address or custom address.',
        },
        values: {
          custom: 'Send to custom address',
        },
      },
    },
    buttons: {
      addThing: {
        title: 'Add thing',
      },
      updateThing: {
        title: 'Update thing',
      },
      save: {
        title: 'Add routine',
      },
      enabled: {
        title: 'Routine is enabled',
      },
      disabled: {
        title: 'Routine is disabled',
      },
      rename: {
        title: 'Rename routine',
      },
      remove: {
        title: 'Remove routine',
      },
      thingToCondition: {
        title: 'Thing to condition',
      },
      thingToAction: {
        title: 'Thing to action',
      },
    },
    groups: {
      actors: {
        analog: 'Analog actors',
        binary: 'Binary actors',
        lights: 'Lights',
        switches: 'Switches',
      },
      sensors: {
        analog: 'Analog sensors',
        binary: 'Binary sensors',
        energy: 'Energy meters',
        environment: 'Environment meters',
        events: 'Events',
        buttons: 'Buttons',
      },
    },
    variations: {
      on: 'On',
      off: 'Off',
      toggle: 'Toggle',
      press: 'Press',
      click: 'Click',
      dbl_click: 'Double click',
      triple_click: 'Triple click',
      lng_click: 'Long click',
      lng_lng_click: 'Extra long click',
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
