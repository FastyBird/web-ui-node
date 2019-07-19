import Vue from 'vue'
import VueRouter from 'vue-router'

// Router middlewares
import auth from './middleware/auth'

Vue.use(VueRouter)

export const HOME_LINK = '/'

export const ACCOUNT_SIGN_IN_LINK = '/sign/in'
export const ACCOUNT_SIGN_UP_LINK = '/sign/up'
export const ACCOUNT_RESET_PASSWORD_LINK = '/password/request'

export const THINGS_LIST_LINK = '/things'
export const THINGS_THING_DETAIL_LINK = '/thing/:id'
export const THINGS_CHANNEL_DETAIL_LINK = '/thing/:id/channel/:channelId'
export const THINGS_THING_SETTINGS_LINK = '/thing/:id/settings'
export const THINGS_CHANNEL_SETTINGS_LINK = '/thing/:id/settings/channel/:channelId'
export const THINGS_CONNECT = '/things/connect'
export const THINGS_HASH_DETAIL = '#detail-'
export const THINGS_HASH_ABOUT = '#about-'
export const THINGS_HASH_NETWORK = '#network-'
export const THINGS_HASH_SETTINGS = '#settings-'
export const THINGS_HASH_CHANNEL_SETTINGS = '#channel-settings-'

export const TRIGGERS_LIST_LINK = '/triggers'
export const TRIGGERS_TRIGGER_DETAIL_LINK = '/trigger/:id'
export const TRIGGERS_CREATE_LINK = '/triggers/create'
export const TRIGGERS_HASH_DETAIL = '#detail-'

export const SCHEDULES_LIST_LINK = '/schedules'
export const SCHEDULES_SCHEDULE_DETAIL_LINK = '/schedules/:id'
export const SCHEDULES_CREATE_LINK = '/schedules/create'

export const ERR_403_LINK = '/error/403'
export const ERR_404_LINK = '/error/404'

// Lazy loading for views components
const HomeView = () => import(/* webpackChunkName: "home" */ '../views/home/Home')

const SignInView = () => import(/* webpackChunkName: "signIn" */ '../views/account/SignIn')
const SignUpView = () => import(/* webpackChunkName: "signUp" */ '../views/account/SignUp')
const RequestPasswordView = () => import(/* webpackChunkName: "requestPassword" */ '../views/account/RequestPassword')

const ThingsView = () => import(/* webpackChunkName: "things" */ '../views/things/Things')
const ThingView = () => import(/* webpackChunkName: "thingDetail" */ '../views/things/Detail/Thing')
const ChannelView = () => import(/* webpackChunkName: "channelDetail" */ '../views/things/Detail/Channel')
const ThingSettingsView = () => import(/* webpackChunkName: "thingSettings" */ '../views/things/Settings/Thing')
const ChannelSettingsView = () => import(/* webpackChunkName: "channelSettings" */ '../views/things/Settings/Channel')

const TriggersView = () => import(/* webpackChunkName: "triggers" */ '../views/triggers/Triggers')
const TriggerView = () => import(/* webpackChunkName: "triggerDetail" */ '../views/triggers/Detail')
const TriggerCreateView = () => import(/* webpackChunkName: "createTrigger" */ '../views/triggers/Create')

const Error403View = () => import(/* webpackChunkName: "error" */ '../views/error/403')
const Error404View = () => import(/* webpackChunkName: "error" */ '../views/error/404')

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      name: 'Home',
      path: HOME_LINK,
      meta: {
        path: HOME_LINK,
        middleware: [auth],
      },
      component: HomeView,
    }, {
      name: 'Sign in',
      path: ACCOUNT_SIGN_IN_LINK,
      meta: {
        path: ACCOUNT_SIGN_IN_LINK,
        transitionName: 'slide',
      },
      component: SignInView,
    }, {
      name: 'Sign up',
      path: ACCOUNT_SIGN_UP_LINK,
      meta: {
        path: ACCOUNT_SIGN_UP_LINK,
        transitionName: 'slide',
      },
      component: SignUpView,
    }, {
      name: 'Reset password',
      path: ACCOUNT_RESET_PASSWORD_LINK,
      meta: {
        path: ACCOUNT_RESET_PASSWORD_LINK,
        transitionName: 'slide',
      },
      component: RequestPasswordView,
    }, {
      name: 'Manage things',
      path: THINGS_LIST_LINK,
      meta: {
        path: THINGS_LIST_LINK,
        middleware: [auth],
      },
      component: ThingsView,
    }, {
      name: 'Thing detail',
      path: THINGS_THING_DETAIL_LINK,
      meta: {
        path: THINGS_THING_DETAIL_LINK,
        middleware: [auth],
        transitionName: 'slide',
      },
      component: ThingView,
    }, {
      name: 'Thing channel detail',
      path: THINGS_CHANNEL_DETAIL_LINK,
      meta: {
        path: THINGS_CHANNEL_DETAIL_LINK,
        middleware: [auth],
      },
      component: ChannelView,
    }, {
      name: 'Thing settings',
      path: THINGS_THING_SETTINGS_LINK,
      meta: {
        path: THINGS_THING_SETTINGS_LINK,
        middleware: [auth],
      },
      component: ThingSettingsView,
    }, {
      name: 'Thing channel settings',
      path: THINGS_CHANNEL_SETTINGS_LINK,
      meta: {
        path: THINGS_CHANNEL_SETTINGS_LINK,
        middleware: [auth],
        transitionName: 'slide',
      },
      component: ChannelSettingsView,
    }, {
      name: 'Triggers list',
      path: TRIGGERS_LIST_LINK,
      meta: {
        path: TRIGGERS_LIST_LINK,
        middleware: [auth],
      },
      component: TriggersView,
    }, {
      name: 'Trigger detail',
      path: TRIGGERS_TRIGGER_DETAIL_LINK,
      meta: {
        path: TRIGGERS_TRIGGER_DETAIL_LINK,
        middleware: [auth],
        transitionName: 'slide',
      },
      component: TriggerView,
    }, {
      name: 'Create trigger',
      path: TRIGGERS_CREATE_LINK,
      meta: {
        path: TRIGGERS_CREATE_LINK,
        middleware: [auth],
      },
      component: TriggerCreateView,
    }, {
      name: 'Error 403',
      path: ERR_403_LINK,
      component: Error403View,
    }, {
      name: 'Error 404',
      path: ERR_404_LINK,
      component: Error404View,
    }, {
      name: 'Default error',
      path: '*',
      component: Error404View,
    },
  ],
})

// Creates a `nextMiddleware()` function which not only
// runs the default `next()` callback but also triggers
// the subsequent Middleware function.
function nextFactory(context, middleware, index) {
  const subsequentMiddleware = middleware[index]

  // If no subsequent Middleware exists,
  // the default `next()` callback is returned.
  if (!subsequentMiddleware) {
    return context.next
  }

  return (...parameters) => {
    // Run the default Vue Router `next()` callback first.
    context.next(...parameters)

    // Than run the subsequent Middleware with a new
    // `nextMiddleware()` callback.
    const nextMiddleware = nextFactory(context, middleware, index + 1)
    subsequentMiddleware({ ...context, next: nextMiddleware })
  }
}

router.beforeEach((to, from, next) => {
  if (to.meta.middleware) {
    const middleware = Array.isArray(to.meta.middleware)
      ? to.meta.middleware
      : [to.meta.middleware]

    const context = {
      from,
      next,
      router,
      to,
    }
    const nextMiddleware = nextFactory(context, middleware, 1)

    return middleware[0]({ ...context, next: nextMiddleware })
  }

  next()
})

export { router }
