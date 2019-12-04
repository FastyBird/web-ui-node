export default ({ app, store }, inject) => {
  inject('tThing', (thing) => {
    return thing.label.capitalize()
  })

  inject('tThingProperty', (thing, property) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('thing_id', thing.id)
      .first()

    if (hardware.isCustom) {
      return property.name.capitalize()
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`)
    }

    return property.name.capitalize()
  })

  inject('tChannelProperty', (thing, property) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first()

    if (hardware.isCustom) {
      return property.name.capitalize()
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`)
    }

    return property.name.capitalize()
  })
}
