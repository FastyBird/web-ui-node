<template>
  <div
    :data-state="thing.state ? 'on' : 'off'"
    class="fb-iot-things-detail-channel-energy__container"
  >
    <things-detail-channel-energy-property
      v-for="property in channel.properties"
      :key="property.id"
      :thing="thing"
      :channel="channel"
      :property="property"
      @clear="showClearTotal(property)"
    />

    <fb-confirmation-window
      v-if="clearTotal.show"
      :transparent-bg="transparentModal"
      icon="trash"
      @confirmed="processClearTotal"
      @close="closeClearTotal"
    >
      <template slot="header">
        {{ $t('headings.clearTotal') }}
      </template>

      <template slot="question">
        <i18n
          path="messages.confirmClearTotal"
          tag="p"
        >
          <strong place="thing">{{ thing.label }}</strong>
        </i18n>
      </template>
    </fb-confirmation-window>
  </div>
</template>

<script>
  const ThingsDetailChannelEnergyProperty = () => import('./Property')

  export default {

    name: 'ThingsDetailChannelEnergy',

    components: {
      ThingsDetailChannelEnergyProperty,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        transparentModal: false,
        clearTotal: {
          show: false,
          property: null,
        },
      }
    },

    created() {
      this.transparentModal = this.$parent.$options.name !== 'Layout'
    },

    methods: {

      /**
       * Show reset total consumption confirmation window
       */
      showClearTotal(property) {
        if (!this._clearingCheck(property)) {
          return
        }

        this.clearTotal.show = true
        this.clearTotal.property = property
      },

      closeClearTotal() {
        this.clearTotal.show = false
        this.clearTotal.property = null
      },

      /**
       * Process resetting of total consumption counter
       */
      processClearTotal() {
        this.clearTotal.show = false

        if (!this._clearingCheck(this.clearTotal.property)) {
          return
        }

        this.$store.dispatch('entities/channel_property_value/setPayload', {
          value: 0.0,
          thing_id: this.thing.id,
          channel_id: this.channel.id,
          property_id: this.clearTotal.property.id,
        }, {
          root: true,
        })
          .then(() => {
            this.clearTotal.property = null
          })
          .catch(() => {
            this.clearTotal.property = null

            this.$toasted.error(this.$t('things.messages.commandNotAccepted', {
              thing: this.thing.label,
            }), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })
          })
      },

      /**
       * Check if property set action is enabled
       *
       * @param {ChannelProperty} property
       *
       * @return {Boolean}
       *
       * @private
       */
      _clearingCheck(property) {
        if (this._.get(property, 'is_settable', false) === false) {
          this.$toasted.error(this.$t('things.messages.notSupported', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return false
        }

        // Check if thing is connected to cloud
        if (this.thing.state !== true) {
          this.$toasted.error(this.$t('things.messages.notOnline', {
            thing: this.thing.label,
          }), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return false
        }

        return true
      },

    },

  }
</script>

<i18n src="./locales.json" />
