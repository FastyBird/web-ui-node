<template>
  <fb-ui-modal-form
    :transparent-bg="transparentBg"
    :lock-submit-button="form.result !== null"
    :result-is-ok="form.result === true"
    icon="pencil-alt"
    @submit="submit"
    @cancel="close"
    @close="close"
  >
    <template slot="header">
      {{ $t('things.headings.rename') }}
    </template>

    <template slot="form">
      <fb-form-input
        v-model="form.model.title"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.title')"
        :has-error="errors.has(form.scope + '.title')"
        :name="'title'"
        :label="$t('things.vendors.global.title.title')"
        :placeholder="thing.channel.title"
        :required="true"
        :tab-index="2"
      />

      <fb-form-text-area
        v-model="form.model.comment"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.comment')"
        :has-error="errors.has(form.scope + '.comment')"
        :name="'comment'"
        :label="$t('things.vendors.global.comment.title')"
        :placeholder="thing.device.title"
        :tab-index="3"
      />
    </template>
  </fb-ui-modal-form>
</template>

<script>
import Device from '~/models/devices-node/devices/Device'
import Channel from '~/models/devices-node/channels/Channel'

export default {

  name: 'ThingsSettingsRename',

  props: {

    thing: {
      type: Object,
      required: true,
    },

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      form: {
        scope: 'thing_edit_name',
        model: {},
        result: null,
      },
    }
  },

  created() {
    this._initModel()

    this.$validator.localize({
      en: {
        custom: {
          title: {
            required: this.$t('things.vendors.global.title.validation.required'),
          },
        },
      },
    })
  },

  mounted() {
    this.$emit('loaded')
  },

  methods: {

    /**
     * Submit thing form
     *
     * @param {Object} event
     */
    submit(event) {
      event && event.preventDefault()

      this.$validator.validateAll(this.form.scope)
        .then((result) => {
          if (result) {
            const errorMessage = this.$t('things.messages.notRenamed', {
              thing: this.thing.channel.title,
            })

            Channel.dispatch('edit', {
              device: this.device,
              id: this.thing.channelId,
              name: this.form.model.title,
            })
              .then(() => {
                Device.dispatch('edit', {
                  id: this.thing.deviceId,
                  name: this.form.model.comment,
                })
                  .catch((e) => {
                    if (this._.get(e, 'exception', null) !== null) {
                      this.handleException(e.exception, errorMessage)
                    } else {
                      this.$flashMessage(errorMessage, 'error')
                    }
                  })
              })
              .catch((e) => {
                if (this._.get(e, 'exception', null) !== null) {
                  this.handleException(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })

            this.form.result = true

            this.$timer.start('close')
          }
        })
        .catch((e) => {
          if (!this.isDev && Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
        })
    },

    /**
     * Close thing rename confirmation window
     *
     * @param {Object} event
     */
    close(event) {
      event && event.preventDefault()

      this._initModel()

      this.$emit('close')
    },

    /**
     * Initialize form model object
     *
     * @private
     */
    _initModel() {
      this.form.model = {
        title: this.thing.channel.title,
        comment: this.thing.device.title,
      }

      this.errors.clear(this.form.scope)
    },

  },

  timers: {
    close: {
      time: 2000,
    },
  },

}
</script>
