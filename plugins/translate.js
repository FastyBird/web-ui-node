import Vue from 'vue'

Vue.prototype.$tChannel = function(thing, channel) {
  if (channel.label !== channel.name) {
    return channel.label
  }

  const hardware = this.$store.getters['entities/hardware/query']()
    .where('thing_id', thing.id)
    .first()

  if (hardware.isCustom) {
    return channel.label
  }

  let channelName = channel.name

  if (channelName.indexOf('_') === -1) {
    if (this.$t(`things.vendors.${hardware.manufacturer}.channels.${channelName}.title`).indexOf('things.vendors.') === -1) {
      return this.$t(`things.vendors.${hardware.manufacturer}.channels.${channelName}.title`)
    }
  } else {
    channelName = channelName.substring(0, (channelName.indexOf('_')))
    const channelNum = channel.name.substring(channel.name.indexOf('_') + 1)

    if (this.$t(`things.vendors.${hardware.manufacturer}.channels.${channelName}.title`).indexOf('things.vendors.') === -1) {
      return `${this.$t(`things.vendors.${hardware.manufacturer}.channels.${channelName}.title`)} ${channelNum}`
    }
  }

  return channel.label
}

Vue.prototype.$tThingProperty = function(thing, property) {
  const hardware = this.$store.getters['entities/hardware/query']()
    .where('thing_id', thing.id)
    .first()

  if (hardware.isCustom) {
    return property.name
  }

  if (this.$t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`).indexOf('things.vendors.') === -1) {
    return this.$t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`)
  }

  return property.name
}

Vue.prototype.$tChannelProperty = function(thing, channel, property) {
  const hardware = this.$store.getters['entities/hardware/query']()
    .where('thing_id', thing.id)
    .first()

  if (hardware.isCustom) {
    return property.name
  }

  if (this.$t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`).indexOf('things.vendors.') === -1) {
    return this.$t(`things.vendors.${hardware.manufacturer}.properties.${property.name}.title`)
  }

  return property.name
}
