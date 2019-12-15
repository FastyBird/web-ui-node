export default ({ app, store }, inject) => {
  inject('tThing', (thing) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return thing.label.capitalize()
    }

    let channel = thing.label
    let channelNum = 0

    if (thing.label.indexOf('_') !== -1) {
      channel = thing.label.substring(0, (thing.label.indexOf('_')))
      channelNum = parseInt(thing.label.substring(thing.label.indexOf('_') + 1), 10)

      if (app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`).indexOf('things.vendors.') === -1) {
        return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`, { number: (channelNum + 1) })
      }
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.channels.${channel}`)
    }

    return thing.label.capitalize()
  })

  inject('tThingDevice', (thing) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return thing.comment.capitalize()
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`)
    }

    return thing.comment.capitalize()
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
