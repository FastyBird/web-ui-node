import Vue from 'vue'

import * as routes from '@/configuration/routes'

import HelpersMixin from '@/mixins/helpers'

Vue.mixin(HelpersMixin)

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

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
    },
    groups: {
      list: routes.GROUPS_LIST_LINK,
      detail: routes.GROUPS_GROUP_DETAIL_LINK,
      create: routes.GROUPS_GROUP_CREATE_LINK,
    },
    routines: {
      list: routes.ROUTINES_LIST_LINK,
      detail: routes.ROUTINES_ROUTINE_DETAIL_LINK,
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
