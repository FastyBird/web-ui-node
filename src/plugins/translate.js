import get from 'lodash/get'

import Hardware from '@/store/modules/io-server/Hardware'

import {
  MANUFACTURER_GENERIC,
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

          if (get(hardware, 'model', null) === MANUFACTURER_GENERIC) {
            return channel.label
          }

          if (this.$t(`things.vendors.${get(hardware, 'manufacturer', MANUFACTURER_GENERIC)}.channels.${channel.name}.title`).indexOf('things.vendors.') === -1) {
            return this.$t(`things.vendors.${get(hardware, 'manufacturer', MANUFACTURER_GENERIC)}.channels.${channel.name}.title`)
          }

          return channel.label
        }
      },
    })

    Object.defineProperty(Vue.prototype, '$tChannelProperty', {
      get() {
        return function(thing, channel, property) {
          const hardware = getThingHardware(thing)

          if (get(hardware, 'model', null) === MANUFACTURER_GENERIC) {
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
