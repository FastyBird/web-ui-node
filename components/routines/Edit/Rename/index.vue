<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    icon="project-diagram"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('headings.rename') }}
    </template>

    <template slot="form">
      <fb-md-form-input
        v-model="form.model.name"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.name')"
        :has-error="errors.has(form.scope + '.name')"
        :name="'name'"
        :label="$t('field.name.title')"
        :required="true"
        :tab-index="2"
        class="m-b-0"
      />

      <fb-md-form-text-area
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

    name: 'RoutinesEditRename',

    props: {

      routine: {
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
          scope: 'routines_edit',
          model: {
            name: '',
            comment: '',
          },
        },
      }
    },

    created() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            name: {
              required: this.$t('field.name.validation.required'),
            },
          },
        },
      })
    },

    mounted() {
      this.$emit('loaded')

      if (this.$parent.$options.name !== 'RoutinesDetail') {
        this.$store.dispatch('entities/trigger/lockForEditing', {
          id: this.routine.id,
        }, {
          root: true,
        })
          .catch(() => {
            // Something wen wrong
          })
      }
    },

    destroyed() {
      if (this.$parent.$options.name !== 'RoutinesDetail') {
        this.$store.dispatch('entities/trigger/unlockForEditing', {
          id: this.routine.id,
        }, {
          root: true,
        })
          .catch(() => {
            // Something wen wrong
          })
      }
    },

    methods: {

      /**
       * Submit create new item form
       *
       * @param {Object} event
       */
      submit(event) {
        event && event.preventDefault()

        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              const errorMessage = this.$t('messages.notEdited', {
                routine: this.form.model.name,
              })

              this.$store.dispatch('entities/trigger/edit', {
                id: this.routine.id,
                data: this.form.model,
              }, {
                root: true,
              })
                .catch(e => {
                  if (e.hasOwnProperty('exception')) {
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
                routine: this.form.model.name,
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
       * Close create item window
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
        this.form.model.name = this.routine.name
        this.form.model.comment = this.routine.comment

        this.errors.clear(this.form.scope)
      },

    },

  }
</script>

<i18n src="./locales.json" />
