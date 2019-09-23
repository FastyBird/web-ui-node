import get from 'lodash/get'

import Hardware from '@/plugins/io-server/store/modules/io-server/Hardware'

import {
  MANUFACTURER_GENERIC,

  HARDWARE_MODEL_CUSTOM,
} from '@/constants'

export default {

  install(Vue) {
    function getThingHardware(thing) {
      return Hardware
        .query()
        .where('thing_id', thing.id)
        .first()
    }

    Object.defineProperty(Vue.prototype, '$tChannel', {
      get() {
        return function(thing, channel) {
          if (channel.label !== channel.name) {
            return channel.label
          }

          const hardware = getThingHardware(thing)

          if (get(hardware, 'model', HARDWARE_MODEL_CUSTOM) === HARDWARE_MODEL_CUSTOM) {
            return channel.label
          }

          let channelName = channel.name

          if (channelName.indexOf('_') === -1) {
            if (this.$t(`things.vendors.${get(hardware, 'manufacturer', MANUFACTURER_GENERIC)}.channels.${channelName}.title`).indexOf('things.vendors.') === -1) {
              return this.$t(`things.vendors.${get(hardware, 'manufacturer', MANUFACTURER_GENERIC)}.channels.${channelName}.title`)
            }
          } else {
            channelName = channelName.substring(0, (channelName.indexOf('_')))
            const channelNum = channel.name.substring(channel.name.indexOf('_') + 1)

            if (this.$t(`things.vendors.${get(hardware, 'manufacturer', MANUFACTURER_GENERIC)}.channels.${channelName}.title`).indexOf('things.vendors.') === -1) {
              return `${this.$t(`things.vendors.${get(hardware, 'manufacturer', MANUFACTURER_GENERIC)}.channels.${channelName}.title`)} ${channelNum}`
            }
          }

          return channel.label
        }
      },
    })

    Object.defineProperty(Vue.prototype, '$tChannelProperty', {
      get() {
        return function(thing, channel, property) {
          const hardware = getThingHardware(thing)

          if (get(hardware, 'model', HARDWARE_MODEL_CUSTOM) === HARDWARE_MODEL_CUSTOM) {
            return property.name
          }

          if (this.$t(`things.vendors.${get(hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${property.name}.title`).indexOf('things.vendors.') === -1) {
            return this.$t(`things.vendors.${get(hardware, 'manufacturer', MANUFACTURER_GENERIC)}.properties.${property.name}.title`)
          }

          return property.name
        }
      },
    })
  },

}
