import { Plugin } from '@nuxt/types'
import ThingInterface from '~/models/Thing'

declare module 'vue/types/vue' {
  interface Vue {
    $channelPropertyIcon(thing:ThingInterface, property:any, def:string): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $channelPropertyIcon(thing:ThingInterface, property:any, def:string): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $channelPropertyIcon(thing:ThingInterface, property:any, def:string): string
  }
}

const channelPropertyIconPlugin: Plugin = ({ store }, inject) => {
  inject('channelPropertyIcon', (thing:ThingInterface, property:any, def:string = 'chart-bar') => {
    switch (property.property) {
      case 'temperature':
        return 'thermometer-half';

      case 'humidity':
        return 'tint';

      case 'air_quality':
        return 'fan';

      case 'light_level':
        return 'sun';

      case 'noise_level':
        return 'microphone-alt';

      case 'power':
        return 'plug';

      case 'current':
      case 'voltage':
        return 'bolt';

      case 'energy':
        return 'calculator';
    }

    return def
  })
};

export default channelPropertyIconPlugin
