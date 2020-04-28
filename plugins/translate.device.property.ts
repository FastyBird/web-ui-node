import { Plugin } from '@nuxt/types'
import capitalize from 'lodash/capitalize'

import ThingInterface from '~/models/things/Thing'
import Hardware from '~/models/devices-node/Hardware'
import { DevicePropertyInterface } from '~/models/devices-node/DeviceProperty'

declare module 'vue/types/vue' {
  interface Vue {
    $tDeviceProperty(thing: ThingInterface, property: DevicePropertyInterface): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $tDeviceProperty(thing: ThingInterface, property: DevicePropertyInterface): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $tDeviceProperty(thing: ThingInterface, property: DevicePropertyInterface): string
  }
}

const tDevicePropertyPlugin: Plugin = ({ app }, inject): void => {
  inject('tDeviceProperty', (thing: ThingInterface, property: DevicePropertyInterface): string => {
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

export default tDevicePropertyPlugin
