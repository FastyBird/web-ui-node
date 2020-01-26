<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    :lock-submit-button="form.result !== null"
    icon="pencil-alt"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('things.headings.rename') }}
    </template>

    <template slot="form">
      <template v-if="form.result === null">
        <fb-form-input
          v-model="form.model.title"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.title')"
          :has-error="errors.has(form.scope + '.title')"
          :name="'title'"
          :label="$t('things.vendors.global.title.title')"
          :placeholder="$tThing(thing, true)"
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
          :placeholder="$tThingDevice(thing, true)"
          :tab-index="3"
        />
      </template>

      <result-ok v-if="form.result === true" />
    </template>
  </fb-modal-form>
</template>

<script>
export default {

  name: 'ThingsSettingsThingRename',

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
        scope: 'io_server_thing_edit_name',
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
              thing: this.$tThing(this.thing),
            })

            this.$store.dispatch('entities/channel/edit', {
              id: this.thing.channel_id,
              data: {
                title: this.form.model.title,
              },
            }, {
              root: true,
            })
              .catch((e) => {
                if (this._.get(e, 'exception', null) !== null) {
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })

            this.$store.dispatch('entities/device/edit', {
              id: this.thing.device_id,
              data: {
                title: this.form.model.comment,
              },
            }, {
              root: true,
            })
              .catch((e) => {
                if (this._.get(e, 'exception', null) !== null) {
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })

            this.form.result = true

            this.$timer.start('close')
          }
        })
        .catch((e) => {
          if (Object.prototype.hasOwnProperty.call(this, '$sentry')) {
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
        title: this.$tThing(this.thing) !== this.$tThing(this.thing, true) ? this.$tThing(this.thing) : null,
        comment: this.$tThingDevice(this.thing) !== this.$tThingDevice(this.thing, true) ? this.$tThingDevice(this.thing) : null,
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
