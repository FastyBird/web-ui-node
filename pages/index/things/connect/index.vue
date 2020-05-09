<template>
  <div class="fb-things-connect-view__container">
    <div
      v-if="step === 1"
      class="fb-things-connect-view__step-1"
    >
      <div class="fb-things-connect-view__step-1-icon">
        <font-awesome-icon icon="plug" />
      </div>
      <div class="fb-things-connect-view__step-1-info">
        <p>
          If you have switch device, press and hold the pairing/control button on the device for 5s to let device
          switch to pairing mode. This mode is signalized by fast blink led control.
        </p>
      </div>

      <fb-divider
        :text="$t('application.misc.or')"
        type="horizontal"
      />

      <div class="fb-things-connect-view__step-1-icon">
        <font-awesome-icon icon="lightbulb" />
      </div>
      <div class="fb-things-connect-view__step-1-info">
        <p>
          If you have smart bulb, turn wall switch 3 times on and of: <br>on - 1s - off - 1s - on - 1s - off - 1s -
          on
        </p>
      </div>

      <fb-button
        variant="primary"
        size="lg"
        block
        mobile
        @click="nextStep"
      >
        {{ $t('application.buttons.next.title') }}
        <font-awesome-icon icon="arrow-right" />
      </fb-button>
    </div>

    <form
      v-if="step === 2"
      class="fb-things-connect-view__step-2"
      @submit.prevent="submitWifiForm"
    >
      <div class="fb-things-connect-view__step-2-row">
        <div>
          <fb-form-input
            v-model="form.model.name"
            v-validate="'required'"
            :data-vv-scope="form.scope"
            :error="errors.first(form.scope + '.name')"
            :has-error="errors.has(form.scope + '.name')"
            :name="'name'"
            :label="$t('things.fields.wifi.name.title')"
            :required="true"
            :tab-index="2"
          />

          <fb-form-input
            v-model="form.model.password"
            :data-vv-scope="form.scope"
            :name="'password'"
            :label="$t('things.fields.wifi.password.title')"
            :placeholder="$t('things.fields.wifi.password.placeholder')"
            :tab-index="3"
            type="password"
          />
        </div>
      </div>

      <fb-button
        variant="primary"
        size="lg"
        block
        mobile
        @click="submitWifiForm"
      >
        {{ $t('application.buttons.next.title') }}
        <font-awesome-icon icon="arrow-right" />
      </fb-button>
    </form>

    <div
      v-if="step === 3"
      class="fb-things-connect-view__step-3"
    >
      <template v-if="search.status === null">
        <font-awesome-icon icon="wifi" />

        <p>
          Open wifi network setting on this device and<br>connect to network with SSID like
          <strong>FB_xxxxxxxx</strong>
        </p>
      </template>

      <template v-if="search.status === 'started'">
        <fb-spinner size="lg" />

        <p>
          Searching...
        </p>
      </template>

      <template v-if="search.status === 'error'">
        <font-awesome-icon icon="exclamation-triangle" />

        <p>
          Couldn't connect to device
        </p>
      </template>

      <template v-if="search.status === 'canceled'">
        <font-awesome-icon icon="minus-circle" />

        <p>
          Canceled on your request
        </p>
      </template>

      <template v-if="search.status === 'configuring'">
        <fb-spinner size="lg" />

        <p>
          Configuring device...
        </p>
      </template>

      <template v-if="search.status === 'finished'">
        <font-awesome-icon icon="wifi" />

        <p>
          Open wifi network setting on this device and<br>connect back to your internet network
        </p>
      </template>

      <template v-if="search.status === 'synchronizing'">
        <fb-spinner size="lg" />

        <p>
          Synchronizing device with server
        </p>
      </template>

      <fb-button
        v-if="search.status === null || search.status === 'canceled' || search.status === 'error'"
        variant="primary"
        size="lg"
        block
        mobile
        @click.prevent="startSearching"
      >
        {{ $t('things.buttons.search.title') }}
        <font-awesome-icon icon="search" />
      </fb-button>

      <fb-button
        v-if="search.status === 'started'"
        variant="primary"
        size="lg"
        block
        mobile
        @click="cancelSearching"
      >
        {{ $t('application.buttons.cancel.title') }}
        <font-awesome-icon icon="stop-circle" />
      </fb-button>

      <fb-button
        v-if="search.status === 'finished' || search.status === 'synchronizing'"
        variant="primary"
        size="lg"
        block
        mobile
        @click="close"
      >
        {{ $t('application.buttons.next.title') }} 2
        <font-awesome-icon icon="arrow-right" />
      </fb-button>
    </div>

    <div
      v-if="step === 4"
      class="fb-things-connect-view__step-4"
    >
      done....
    </div>
  </div>
</template>

<script>
import {
  THINGS_HASH_CONNECT,
} from '~/configuration/routes'

import SharedConnectThing from '~/components/things/Shared/ThingConnect'

export default {

  name: 'ThingsConnectPage',

  transition: 'fade',

  extends: SharedConnectThing,

  computed: {

    /**
     * @returns {String}
     */
    windowSize() {
      return this.$store.state.template.windowSize
    },

  },

  watch: {

    windowSize(val) {
      if (val !== 'xs') {
        this.$router.push(this.localePath({
          name: this.$routes.things.list,
          hash: THINGS_HASH_CONNECT,
        }))
      }
    },

    step() {
      this._configureNavigation()
    },

  },

  fetch({ app, store, params, error }) {
    store.dispatch('template/resetHeadings', null, {
      root: true,
    })

    store.dispatch('template/resetButtons', null, {
      root: true,
    })

    store.dispatch('template/setLeftButton', {
      name: app.i18n.t('application.buttons.back.title'),
      icon: 'arrow-left',
    }, {
      root: true,
    })

    store.dispatch('template/setFullRowHeading', null, {
      root: true,
    })

    store.dispatch('template/setHeading', {
      heading: 'Connect',
    }, {
      root: true,
    })

    store.dispatch('template/setHeadingIcon', {
      icon: 'plug',
    }, {
      root: true,
    })

    store.dispatch('app/bottomMenuCollapse', null, {
      root: true,
    })
  },

  beforeMount() {
    if (this.windowSize !== null && this.windowSize !== 'xs') {
      this.$router.push(this.localePath({
        name: this.$routes.things.list,
        hash: THINGS_HASH_CONNECT,
      }))

      return
    }

    this._configureNavigation()

    this.$bus.$on('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$on('heading_right_button-clicked', this.rightButtonAction)
  },

  mounted() {
    this.$bus.$emit('wait-page_reloading', false)
  },

  beforeDestroy() {
    this.$bus.$off('heading_left_button-clicked', this.leftButtonAction)
    this.$bus.$off('heading_right_button-clicked', this.rightButtonAction)
  },

  methods: {

    close() {
      this.$router.push(this.localePath({
        name: this.$routes.things.list,
      }))
    },

    /**
     * Header left button action event
     */
    leftButtonAction() {
      if (this.step === 1) {
        if (this.windowSize === 'xs') {
          this.$bus.$emit('wait-page_reloading', 10)
        }

        this.$router.push(this.localePath(this.$routes.things.list))
      } else {
        this.previousStep()
      }
    },

    /**
     * Header right button action event
     */
    rightButtonAction() {
      if (this.windowSize === 'xs') {
        this.$bus.$emit('wait-page_reloading', 10)
      }

      this.$router.push(this.localePath(this.$routes.things.list))
    },

    /**
     * Configure page header for small devices
     *
     * @private
     */
    _configureNavigation() {
      this.$store.dispatch('template/resetHeadings', null, {
        root: true,
      })

      this.$store.dispatch('template/resetButtons', null, {
        root: true,
      })

      if (this.step === 1) {
        this.$store.dispatch('template/setLeftButton', {
          name: this.$t('application.buttons.back.title'),
          icon: 'arrow-left',
        }, {
          root: true,
        })
      } else {
        this.$store.dispatch('template/setLeftButton', {
          name: this.$t('application.buttons.back.title'),
          icon: 'arrow-left',
        }, {
          root: true,
        })
      }

      this.$store.dispatch('template/setRightButton', {
        name: this.$t('application.buttons.cancel.title'),
      }, {
        root: true,
      })

      this.$store.dispatch('template/setFullRowHeading', null, {
        root: true,
      })

      this.$store.dispatch('template/setHeading', {
        heading: 'Connect',
      }, {
        root: true,
      })

      this.$store.dispatch('template/setHeadingIcon', {
        icon: 'plug',
      }, {
        root: true,
      })

      this.$store.dispatch('app/bottomMenuCollapse', null, {
        root: true,
      })
    },

  },

  head() {
    return {
      title: this.$t('meta.things.connect.title'),
    }
  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
