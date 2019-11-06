export default ({ app, store }, inject) => {
  inject('tChannel', (thing, channel) => {
    if (channel.label !== channel.name) {
      return channel.label
    }

    const hardware = store.getters['entities/hardware/query']()
      .where('thing_id', thing.id)
      .first()

    if (hardware.isCustom) {
      return channel.label
    }

    let channelName = channel.name

    if (channelName.indexOf('_') === -1) {
      if (app.i18n.t(`things.vendors.${hardware.manufacturer}.channels.${channelName}.title`).indexOf('things.vendors.') === -1) {
        return app.i18n.t(`things.vendors.${hardware.manufacturer}.channels.${channelName}.title`)
      }
    } else {
      channelName = channelName.substring(0, (channelName.indexOf('_')))
      const channelNum = channel.name.substring(channel.name.indexOf('_') + 1)

      if (app.i18n.t(`things.vendors.${hardware.manufacturer}.channels.${channelName}.title`).indexOf('things.vendors.') === -1) {
        return `${app.i18n.t(`things.vendors.${hardware.manufacturer}.channels.${channelName}.title`)} ${channelNum}`
      }
    }

    return channel.label
  })

  inject('tThingProperty', (thing, property) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('thing_id', thing.id)
      .first()

    if (hardware.isCustom) {
      return property.name
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`)
    }

    return property.name
  })

  inject('tChannelProperty', (thing, channel, property) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('thing_id', thing.id)
      .first()

    if (hardware.isCustom) {
      return property.name
    }

    if (app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`).indexOf('things.vendors.') === -1) {
      return app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`)
    }

    return property.name
  })
}
