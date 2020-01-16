import { Plugin } from '@nuxt/types'
import get from 'lodash/get'

declare module 'vue/types/vue' {
  interface Vue {
    $routineIcon(routine:any): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $routineIcon(routine:any): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $routineIcon(routine:any): string
  }
}

const routineIconPlugin: Plugin = ({ store }, inject) => {
  inject('routineIcon', (routine:any) => {
    return get(routine, 'icon', 'project-diagram')
  })
};

export default routineIconPlugin
