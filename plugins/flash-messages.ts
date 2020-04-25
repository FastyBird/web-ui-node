import { Plugin } from '@nuxt/types'
import { ToastObject } from 'vue-toasted'

declare module 'vue/types/vue' {
  interface Vue {
    $flashMessage(message: string, type: string): void
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $flashMessage(message: string, type: string): void
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $flashMessage(message: string, type: string): void
  }
}

const flashMessagePlugin: Plugin = ({ app }, inject): void => {
  inject('flashMessage', (message: string, type: string = 'success'): void => {
    if (type === 'success') {
      app.$toast.success(message, {
        action: {
          text: app.i18n.t('application.buttons.close.title'),
          onClick: (e: Event, toastObject: ToastObject) => {
            toastObject.goAway(0)
          },
        },
      })
    } else if (type === 'info') {
      app.$toast.info(message, {
        action: {
          text: app.i18n.t('application.buttons.close.title'),
          onClick: (e: Event, toastObject: ToastObject) => {
            toastObject.goAway(0)
          },
        },
      })
    } else if (type === 'error') {
      app.$toast.error(message, {
        action: {
          text: app.i18n.t('application.buttons.close.title'),
          onClick: (e: Event, toastObject: ToastObject) => {
            toastObject.goAway(0)
          },
        },
      })
    }
  })
}

export default flashMessagePlugin
