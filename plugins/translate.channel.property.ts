import { Plugin } from '@nuxt/types'
import capitalize from 'lodash/capitalize'

import ThingInterface from '~/models/Thing'
import Hardware from '~/models/devices-node/Hardware'
import { ChannelPropertyInterface } from '~/models/devices-node/ChannelProperty'

declare module 'vue/types/vue' {
  interface Vue {
    $tChannelProperty(thing: ThingInterface, property: ChannelPropertyInterface): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $tChannelProperty(thing: ThingInterface, property: ChannelPropertyInterface): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $tChannelProperty(thing: ThingInterface, property: ChannelPropertyInterface): string
  }
}

const tChannelPropertyPlugin: Plugin = ({ app }, inject): void => {
  inject('tChannelProperty', (thing: ThingInterface, property: ChannelPropertyInterface): string => {
    const hardware = Hardware
      .query()
      .where('device_id', thing.device_id)
      .first()

    if (!hardware || hardware.isCustom) {
      return capitalize(property.property)
    }

    if (!`${app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`)}`.includes('things.vendors.')) {
      return `${app.i18n.t(`things.vendors.${hardware.manufacturer}.properties.${property.property}.title`)}`
    }

    return capitalize(property.property)
  })
}

export default tChannelPropertyPlugin
