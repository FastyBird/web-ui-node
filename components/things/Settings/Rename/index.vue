<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    icon="pencil-alt"
    @submit="submit"
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
        :placeholder="thing.name"
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
        :tab-index="3"
      />
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
          .then(result => {
            if (result) {
              const errorMessage = this.$t('things.messages.notRenamed', {
                thing: this.$tThing(this.thing),
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
                    this.$flashMessage(errorMessage, 'error')
                  }
                })

              this.$flashMessage(this.$t('things.messages.renamed', {
                thing: this.form.model.title,
              }))

              this._initModel()

              this.$emit('close')
            } else {
              this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
            }
          })
          .catch(() => {
            this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
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
