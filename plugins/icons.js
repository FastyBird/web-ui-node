import get from 'lodash/get'

export default ({ store }, inject) => {
  inject('thingIcon', (thing) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('thing_id', thing.id)
      .first()

    if (hardware === null || hardware.isCustom) {
      return 'plug'
    }

    if (hardware.isManufacturerItead) {
      switch (hardware.model) {
        case 'sonoff_sc':
          return 'thermometer-half'

        case 'sonoff_pow':
        case 'sonoff_pow_r2':
          return 'calculator'
      }
    }

    return 'plug'
  })

  inject('channelIcon', (thing, channel) => {
    if (channel.isEnergy) {
      return 'calculator'
    } else if (channel.isSwitch) {
      return 'toggle-on'
    } else if (channel.isLight) {
      return 'lightbulb'
    } else if (channel.isAnalogSensor) {
      return 'chart-line'
    } else if (channel.isBinarySensor) {
      return 'chart-bar'
    }

    return 'plug'
  })

  inject('channelPropertyIcon', (thing, channel, property, def = 'chart-bar') => {
    switch (property.property) {
      case 'temperature':
        return 'thermometer-half'

      case 'humidity':
        return 'tint'

      case 'air_quality':
        return 'fan'

      case 'light_level':
        return 'sun'

      case 'noise_level':
        return 'microphone-alt'

      case 'power':
        return 'plug'

      case 'current':
      case 'voltage':
        return 'bolt'

      case 'energy':
        return 'calculator'
    }

    return def
  })

  inject('routineIcon', (routine) => {
    return get(routine, 'icon', 'project-diagram')
  })
}
