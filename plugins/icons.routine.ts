import { Plugin } from '@nuxt/types'
import get from 'lodash/get'
import { TriggerInterface } from '~/models/triggers-node/Trigger'

declare module 'vue/types/vue' {
  interface Vue {
    $routineIcon(routine: any): string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $routineIcon(routine: any): string
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $routineIcon(routine: any): string
  }
}

const routineIconPlugin: Plugin = ({ store }, inject): void => {
  inject('routineIcon', (routine: TriggerInterface): string => {
    return get(routine.params, 'icon', 'project-diagram')
  })
}

export default routineIconPlugin
