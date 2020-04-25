import { Plugin } from '@nuxt/types'

import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $bus: EventBus
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $bus: EventBus
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $bus: EventBus
  }
}

class EventBus {
  private readonly v: Vue

  constructor() {
    this.v = new Vue({})
  }

  $on(...data: any): void {
    this.v.$on.apply(this.v, data)
  }

  $off(...data: any): void {
    this.v.$off.apply(this.v, data)
  }

  $emit(...data: any): void {
    this.v.$emit.apply(this.v, data)
  }

  $once(...data: any): void {
    this.v.$once.apply(this.v, data)
  }
}

const eventBusPlugin: Plugin = (context, inject): void => {
  inject('bus', new EventBus())
}

export default eventBusPlugin
