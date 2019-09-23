<template>
  <fb-modal-form
    icon="plug"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.name') }}
    </template>

    <template slot="form">
      <fb-md-form-input
        v-model="form.model.title"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.title')"
        :has-error="errors.has(form.scope + '.title')"
        :name="'title'"
        :label="$t('field.title.title')"
        :placeholder="$tChannel(thing, channel)"
        :tab-index="2"
      />
    </template>
  </fb-modal-form>
</template>

<script>
  export default {

    name: 'ThingsEditChannelRename',

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
        form: {
          scope: 'io_server_channel_edit_name',
          model: {
            title: undefined,
          },
        },
      }
    },

    created() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            title: {
              required: this.$t('field.title.validation.required'),
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
       * Submit channel edit form
       *
       * @param {Object} event
       */
      submit(event) {
        event && event.preventDefault()

        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              const errorMessage = this.$t('messages.notEdited', {
                thing: this.thing.label,
                channel: this.$tChannel(this.thing, this.channel),
              })

              this.$store.dispatch('entities/channel/edit', {
                id: this.channel.id,
                data: this.form.model,
              }, {
                root: true,
              })
                .catch(e => {
                  if (this._.get(e, 'exception', null) !== null) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$toasted.error(errorMessage, {
                      action: {
                        text: this.$t('application.buttons.close.title'),
                        onClick: (evnt, toastObject) => {
                          toastObject.goAway(0)
                        },
                      },
                    })
                  }
                })

              this.$toasted.success(this.$t('messages.edited', {
                thing: this.thing.label,
                channel: this.$tChannel(this.thing, this.channel),
              }), {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })

              this._initModel()

              this.$emit('close')
            } else {
              this.$toasted.info(this.$t('application.messages.fixAllFormErrors'), {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })
            }
          })
          .catch(() => {
            this.$toasted.info(this.$t('application.messages.fixAllFormErrors'), {
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
       * Close thing remove confirmation window
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
        this.form.model.title = this.channel.title

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
