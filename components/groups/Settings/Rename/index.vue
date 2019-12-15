<template>
  <fb-modal-form
    :transparent-bg="transparentBg"
    :lock-submit-button="form.result !== null"
    icon="pencil-alt"
    @submit="submit"
    @close="close"
  >
    <template slot="header">
      {{ $t('groups.headings.rename') }}
    </template>

    <template slot="form">
      <template v-if="form.result === null">
        <fb-form-input
          v-model="form.model.title"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.title')"
          :has-error="errors.has(form.scope + '.title')"
          :name="'title'"
          :label="$t('groups.fields.title.title')"
          :placeholder="group.name"
          :tab-index="2"
        />

        <fb-form-text-area
          v-model="form.model.comment"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.comment')"
          :has-error="errors.has(form.scope + '.comment')"
          :name="'comment'"
          :label="$t('groups.fields.comment.title')"
          :tab-index="3"
        />
      </template>

      <result-ok v-if="form.result === true" />
    </template>
  </fb-modal-form>
</template>

<script>
  export default {

    name: 'GroupsSettingsGroupRename',

    props: {

      group: {
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
          scope: 'io_server_group_edit_name',
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
            title: {
              required: this.$t('groups.fields.title.validation.required'),
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
       * Submit group form
       *
       * @param {Object} event
       */
      submit(event) {
        event && event.preventDefault()

        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              const errorMessage = this.$t('groups.messages.notEdited', {
                group: this.group.label,
              })

              this.$store.dispatch('entities/group/edit', {
                id: this.group.id,
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
       * Close group rename confirmation window
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
          title: this.group.title,
          comment: this.group.comment,
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
