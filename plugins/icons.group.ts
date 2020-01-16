import { Plugin } from '@nuxt/types'
import get from 'lodash/get'

declare module 'vue/types/vue' {
  interface Vue {
    $groupIcon(group:any): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $groupIcon(group:any): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $groupIcon(group:any): string
  }
}

const groupIconPlugin: Plugin = ({ app }, inject) => {
  inject('groupIcon', (group:any) => {
    return get(group, 'icon', 'folder')
  })
};

export default groupIconPlugin
