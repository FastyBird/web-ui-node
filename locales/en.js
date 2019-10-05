export default {
  welcome: 'hokuspokus',
  layout: {
    projectName: 'FastyBird.com',
    buttons: {
      toggleNavigation: {
        title: 'Toggle navigation',
      },
    },
  },
  application: {
    headings: {
      offlineState: 'No internet connection',
      things: {
        list: 'Things',
      },
      triggers: {
        list: 'Triggers',
        create: 'Create trigger',
      },
    },
    buttons: {
      remove: {
        title: 'Delete',
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
    },
    tabs: {
      home: {
        title: 'Home',
      },
      things: {
        title: 'Things',
      },
      triggers: {
        title: 'Triggers',
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
      triggers: 'Triggers',
      schedules: 'Schedules',
    },
    userMenu: {
      accountSettings: 'Account settings',
      accountProfile: 'Profile settings',
      passwordChange: 'Password change',
      securitySettings: 'Security settings',
      signOut: 'Sign out',
    },
  },
  home: {
    buttons: {
      things: {
        title: 'Things',
      },
    },
  },
  things: {
    messages: {
      edited: 'Thing {thing} was successfully edited.',
      notEdited: 'Thing {thing} couldn\'t be updated, please try again later.',
      notFound: 'Thing was not found, please try reload page.',
      commandNotAccepted: 'Last command was not accepted by thing <strong>{thing}</strong>.',
      notOnline: 'Thing <strong>{thing}</strong> is not connected to cloud.',
      notSupported: 'This function is not supported by <strong>{thing}</strong>.',
    },
    vendors: {
      itead: {
        channels: {
          switch: {
            title: 'Switch',
          },
          button: {
            title: 'Button',
          },
        },
        properties: {
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
          button: 'Status LED mode',
          heading: 'Status LED mode',
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
        btn_delay: {
          button: 'Double click delay',
          heading: 'Double click delay',
          description: 'Delay in milliseconds to detect a double click (from 0 to 1000ms).',
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
          button: 'Power units',
          heading: 'Power units',
          values: {
            watts: 'Watts (W)',
            kilowatts: 'Kilowatts (kW)',
          },
        },
        sensor_energy_units: {
          button: 'Energy units',
          heading: 'Energy units',
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
}
