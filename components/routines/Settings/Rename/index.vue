<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    :lock-submit-button="form.result !== null"
    icon="pencil-alt"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('routines.headings.rename') }}
    </template>

    <template slot="form">
      <template v-if="form.result === null">
        <fb-form-input
          v-model="form.model.name"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.name')"
          :has-error="errors.has(form.scope + '.name')"
          :name="'name'"
          :label="$t('routines.fields.name.title')"
          :placeholder="routine.name"
          :required="true"
          :tab-index="2"
        />

        <fb-form-text-area
          v-model="form.model.comment"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.comment')"
          :has-error="errors.has(form.scope + '.comment')"
          :name="'comment'"
          :label="$t('routines.fields.comment.title')"
          :tab-index="3"
        />
      </template>

      <result-ok v-if="form.result === true" />
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
          result: null,
        },
      }
    },

    created() {
      this._initModel()

      this.$validator.localize({
        en: {
          custom: {
            name: {
              required: this.$t('routines.fields.name.validation.required'),
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
              const errorMessage = this.$t('routines.messages.notEdited', {
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
                    this.$flashMessage(errorMessage, 'error')
                  }
                })

              this.form.result = true

              this.$timer.start('close')
            } else {
              this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
            }
          })
          .catch(() => {
            this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
          })
      },

      /**
       * Close form item window
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

        this.form.result = null

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
