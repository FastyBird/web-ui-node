import { mapState } from 'vuex'

import axios from 'axios'

import Thing from '~/models/things/Thing'

const deviceApi = {
  getDeviceStatus: () => {
    return new Promise(resolve => setTimeout(resolve, 2000))
  },
  configureDevice: () => {
    return new Promise(resolve => setTimeout(resolve, 2000))
  },
}

export default {

  data() {
    return {
      step: 1,
      search: {
        status: null,
        counter: 0,
        device: {
          id: null,
          reinitialize: false,
        },
      },
      form: {
        scope: 'connect_thing',
        model: {
          name: '',
          password: '',
        },
      },
      request: {
        cancel: null,
      },
      waitTimeout: {
        delay: 180000,
        timer: null,
      },
    }
  },

  computed: {

    ...mapState({
      connectionStatus: state => state.connectionStatus,
    }),

    ...mapState('wamp', {
      wsConnected: state => state.isConnected,
    }),

  },

  watch: {

    'search.status'(val) {
      if (val === 'finished' && this.connectionStatus && this.wsConnected) {
        this._fetchNewThing()
      }
    },

    connectionStatus(val) {
      if (this.search.status === 'finished' && val === true && this.wsConnected) {
        this._fetchNewThing()
      }
    },

    wsConnected(val) {
      if (this.search.status === 'finished' && this.connectionStatus && val === true) {
        this._fetchNewThing()
      }
    },

  },

  created() {
    this.$validator.localize({
      en: {
        custom: {
          name: {
            required: this.$t('things.fields.wifi.name.validation.required'),
          },
        },
      },
    })
  },

  methods: {

    /**
     * Move to previous form step
     */
    previousStep() {
      this.step--

      if (this.step < 1) {
        this.step = 1
      }
    },

    /**
     * Move to next form step
     */
    nextStep() {
      this.step++

      if (this.step > 4) {
        this.step = 4
      }
    },

    /**
     * Process provided wifi credentials
     */
    submitWifiForm() {
      this.$validator.validateAll(this.form.scope)
        .then((result) => {
          if (result) {
            this.nextStep()
          }
        })
        .catch((e) => {
          if (!this.isDev && Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
        })
    },

    /**
     * Start searching for new device
     */
    startSearching() {
      const cancelToken = axios.CancelToken

      this.request.source = cancelToken.source()

      this.search.status = 'started'

      // Check device endpoint if is available...
      deviceApi.getDeviceStatus({
        cancelToken: this.request.source.token,
      })
        .then((data) => {
          this.search.status = 'configuring'
          this.search.device.id = data.data.cloud.thing

          const thing = Thing
            .query()
            .with('device')
            .with('channel')
            .where('device_id', this.search.device.id)
            .first()

          if (thing !== null) {
            this.search.device.reinitialize = true
          }

          // ...if yes, configure this device
          deviceApi.configureDevice(
            this.form.model.name,
            this.form.model.password,
          )
            .then(() => {
              this.search.status = 'finished'

              this.waitTimeout.timer = setTimeout(() => {
                // Waiting for device response exceeded
                this.search.status = 'error'

                this.$flashMessage(this.$t('messages.unableToConnect'), 'error')
              }, this.waitTimeout.delay)
            })
            .catch(() => {
              this.search.status = 'error'

              this.$flashMessage(this.$t('messages.unableToConnect'), 'error')
            })
        })
        .catch((e) => {
          // Request is canceled by user
          if (axios.isCancel(e)) {
            this.search.status = 'canceled'
            this.search.counter = 0
          } else if (this.search.counter < 1) {
            this.search.counter++

            // Wait before next try
            this._sleep(5000)
              .then(() => {
                this.startSearching()
              })
          } else {
            this.search.status = 'error'
            this.search.counter = 0

            this.$flashMessage(this.$t('messages.unableToConnect'), 'error')
          }
        })
    },

    /**
     * Cancel searching for new device
     */
    cancelSearching() {
      this.request.source.cancel('Operation canceled by the user.')
    },

    _fetchNewThing() {
      this.search.status = 'synchronizing'

      if (this.search.device.reinitialize) {
        Thing.dispatch('fetch')
          .then(() => {
            this.step = 4
          })
          .catch(() => {

          })
      }
    },

    _sleep(time) {
      return new Promise(resolve => setTimeout(resolve, time))
    },

  },

}
