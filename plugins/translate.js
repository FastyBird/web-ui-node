import get from 'lodash/get'
import capitalize from 'lodash/capitalize'

export default ({ app, store }, inject) => {
  inject('tThing', (thing, original = false) => {
    if (get(thing, 'channel.title', null) !== null && !original) {
      return get(thing, 'channel.title', null)
    }

    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    const channel = get(thing, 'channel.name', null)

    if (!hardware || hardware.isCustom) {
      return capitalize(channel)
    }

    if (channel.includes('_')) {
      const channelPart = channel.substring(0, (channel.indexOf('_')))
      const channelNum = parseInt(channel.substring(channel.indexOf('_') + 1), 10)

      if (!app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channelPart}`).includes('things.vendors.')) {
        return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channelPart}`, { number: (channelNum + 1) })
      }
    }

    if (!app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`).includes('things.vendors.')) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`)
    }

    return capitalize(channel)
  })

  inject('tThingDevice', (thing, original = false) => {
    if (get(thing, 'device.title', null) !== null && !original) {
      return get(thing, 'device.title', null)
    }

    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    const device = get(thing, 'device.name', null)

    if (!hardware || hardware.isCustom) {
      return capitalize(device)
    }

    if (!app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`).includes('things.vendors.')) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`)
    }

    return capitalize(device)
  })

  inject('tThingProperty', (thing, property) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return capitalize(property.property)
    }

    if (!app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`).includes('things.vendors.')) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`)
    }

    return capitalize(property.property)
  })

  inject('tChannelProperty', (thing, property) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return capitalize(property.property)
    }

    if (!app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`).includes('things.vendors.')) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`)
    }

    return capitalize(property.property)
  })
}
