import { Plugin } from '@nuxt/types'

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

const groupIconPlugin: Plugin = (context, inject): void => {
  inject('groupIcon', (group: any): string => {
    return group.icon
  })
}

export default groupIconPlugin
