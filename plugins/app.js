import Vue from 'vue'

import FastyBirdTheme from '@/node_modules/@fastybird-com/theme'

import * as routes from '@/configuration/routes'

import HelpersMixin from '@/mixins/helpers'

Vue.mixin(HelpersMixin)

Vue.use(FastyBirdTheme)

export default ({ app }, inject) => {
  inject('routes', {
    home: routes.HOME_LINK,
    account: {
      signIn: routes.ACCOUNT_SIGN_IN_LINK,
      signUp: routes.ACCOUNT_SIGN_UP_LINK,
      resetPassword: routes.ACCOUNT_RESET_PASSWORD_LINK,
    },
    things: {
      list: routes.THINGS_LIST_LINK,
      detail: routes.THINGS_THING_DETAIL_LINK,
      routines: routes.THINGS_THING_ROUTINES_LINK,
      connect: routes.THINGS_THING_CONNECT_LINK,
      channel: routes.THINGS_CHANNEL_DETAIL_LINK,
    },
    groups: {
      list: routes.GROUPS_LIST_LINK,
      detail: routes.GROUPS_GROUP_DETAIL_LINK,
    },
    routines: {
      list: routes.ROUTINES_LIST_LINK,
      detail: routes.ROUTINES_ROUTINE_DETAIL_LINK,
      settings: routes.ROUTINES_ROUTINE_SETTINGS_LINK,
      create: routes.ROUTINES_CREATE_LINK,
    },
  })

  inject('flashMessage', (message, type = 'success') => {
    if (type === 'success') {
      app.$toast.success(message, {
        action: {
          text: app.i18n.t('application.buttons.close.title'),
          onClick: (e, toastObject) => {
            toastObject.goAway(0)
          },
        },
      })
    } else if (type === 'info') {
      app.$toast.info(message, {
        action: {
          text: app.i18n.t('application.buttons.close.title'),
          onClick: (e, toastObject) => {
            toastObject.goAway(0)
          },
        },
      })
    } else if (type === 'error') {
      app.$toast.error(message, {
        action: {
          text: app.i18n.t('application.buttons.close.title'),
          onClick: (e, toastObject) => {
            toastObject.goAway(0)
          },
        },
      })
    }
  })
}
