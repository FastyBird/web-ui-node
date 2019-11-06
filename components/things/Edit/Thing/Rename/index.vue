<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    icon="pencil-alt"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.rename') }}
    </template>

    <template slot="form">
      <fb-form-input
        v-model="form.model.title"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.title')"
        :has-error="errors.has(form.scope + '.title')"
        :name="'title'"
        :label="$t('field.title.title')"
        :placeholder="thing.name"
        :tab-index="2"
      />

      <fb-form-text-area
        v-model="form.model.comment"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.comment')"
        :has-error="errors.has(form.scope + '.comment')"
        :name="'comment'"
        :label="$t('field.comment.title')"
        :tab-index="3"
      />
    </template>
  </fb-modal-form>
</template>

<script>
  export default {

    name: 'ThingsEditThingRename',

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
       * Submit thing form
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
              })

              this.$store.dispatch('entities/thing/edit', {
                id: this.thing.id,
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
                thing: this.form.model.title,
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
          title: this.thing.title,
          comment: this.thing.comment,
        }

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
