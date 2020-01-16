import get from 'lodash/get'
import capitalize from 'lodash/capitalize'

export default ({ app, store }, inject) => {
  inject('tThing', (thing) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return capitalize(get(thing, 'channel.label', ''))
    }

    let channel = get(thing, 'channel.label', '')
    let channelNum = 0

    if (get(thing, 'channel.label', '').includes('_')) {
      channel = get(thing, 'channel.label', '').substring(0, (get(thing, 'channel.label', '').indexOf('_')))
      channelNum = parseInt(get(thing, 'channel.label', '').substring(get(thing, 'channel.label', '').indexOf('_') + 1), 10)

      if (!app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`).includes('things.vendors.')) {
        return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`, { number: (channelNum + 1) })
      }
    }

    if (!app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`).includes('things.vendors.')) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`)
    }

    return capitalize(get(thing, 'channel.label', ''))
  })

  inject('tThingDevice', (thing) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return capitalize(get(thing, 'device.name', ''))
    }

    if (!app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`).includes('things.vendors.')) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`)
    }

    return capitalize(get(thing, 'device.name', ''))
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
