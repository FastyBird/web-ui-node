import get from 'lodash/get'

export default ({ store }, inject) => {
  inject('groupIcon', (group) => {
    return get(group, 'icon', 'folder')
  })

  inject('thingIcon', (thing) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
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

  inject('channelPropertyIcon', (thing, property, def = 'chart-bar') => {
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
