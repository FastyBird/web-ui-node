import { Plugin } from '@nuxt/types'
import ThingInterface from '~/models/Thing'

declare module 'vue/types/vue' {
  interface Vue {
    $thingIcon(thing:ThingInterface): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $thingIcon(thing:ThingInterface): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $thingIcon(thing:ThingInterface): string
  }
}

const thingIconPlugin: Plugin = ({ store }, inject) => {
  inject('thingIcon', (thing:ThingInterface) => {
    const hardware = store.getters['entities/hardware/query']()
      .where('device_id', thing.device_id)
      .first();

    if (hardware === null || hardware.isCustom) {
      return 'plug';
    }

    if (hardware.isManufacturerItead) {
      switch (hardware.model) {
        case 'sonoff_sc':
          return 'thermometer-half';

        case 'sonoff_pow':
        case 'sonoff_pow_r2':
          return 'calculator';
      }
    }

    return 'plug'
  })
};

export default thingIconPlugin
