import { Plugin } from '@nuxt/types'
import { GroupInterface } from '~/models/devices-node/Group'

declare module 'vue/types/vue' {
  interface Vue {
    $groupIcon(group: any): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $groupIcon(group: any): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $groupIcon(group: any): string
  }
}

const groupIconPlugin: Plugin = ({ app }, inject): void => {
  inject('groupIcon', (group: GroupInterface): string => {
    return group.icon
  })
}

export default groupIconPlugin
