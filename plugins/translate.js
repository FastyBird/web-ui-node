import get from 'lodash/get'

export default ({ app, store }, inject) => {
  inject('tThing', (thing) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return get(thing, 'channel.label', '').capitalize()
    }

    let channel = get(thing, 'channel.label', '')
    let channelNum = 0

    if (get(thing, 'channel.label', '').indexOf('_') !== -1) {
      channel = get(thing, 'channel.label', '').substring(0, (get(thing, 'channel.label', '').indexOf('_')))
      channelNum = parseInt(get(thing, 'channel.label', '').substring(get(thing, 'channel.label', '').indexOf('_') + 1), 10)

      if (app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`).indexOf('things.vendors.') === -1) {
        return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`, { number: (channelNum + 1) })
      }
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`)
    }

    return get(thing, 'channel.label', '').capitalize()
  })

  inject('tThingDevice', (thing) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return get(thing, 'device.name', '').capitalize()
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`)
    }

    return get(thing, 'device.name', '').capitalize()
  })

  inject('tThingProperty', (thing, property) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return property.property.capitalize()
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`)
    }

    return property.property.capitalize()
  })

  inject('tChannelProperty', (thing, property) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return property.property.capitalize()
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`)
    }

    return property.property.capitalize()
  })
}
