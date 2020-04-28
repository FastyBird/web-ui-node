import { Plugin } from '@nuxt/types'
import get from 'lodash/get'
import capitalize from 'lodash/capitalize'

import ThingInterface from '~/models/things/Thing'
import Hardware from '~/models/devices-node/Hardware'

declare module 'vue/types/vue' {
  interface Vue {
    $tThingDevice(thing: ThingInterface, original: boolean): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $tThingDevice(thing: ThingInterface, original: boolean): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $tThingDevice(thing: ThingInterface, original: boolean): string
  }
}

const tThingDevicePlugin: Plugin = ({ app }, inject): void => {
  inject('tThingDevice', (thing: ThingInterface, original: boolean = false): string => {
    if (get(thing, 'device.title', null) !== null && !original) {
      return get(thing, 'device.title', null)
    }

    const hardware = Hardware
      .query()
      .where('device_id', thing.device_id)
      .first()

    const device = get(thing, 'device.name', null)

    if (!hardware || hardware.isCustom) {
      return capitalize(device)
    }

    if (!`${app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`)}`.includes('things.vendors.')) {
      return `${app.i18n.t(`things.vendors.${hardware.manufacturer}.things.${hardware.model}.title`)}`
    }

    return capitalize(device)
  })
}

export default tThingDevicePlugin
