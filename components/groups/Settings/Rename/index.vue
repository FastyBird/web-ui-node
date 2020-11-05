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
      {{ $t('groups.headings.rename') }}
    </template>

    <template slot="form">
      <fb-form-input
        v-model="form.model.name"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.name')"
        :has-error="errors.has(form.scope + '.name')"
        :name="'name'"
        :label="$t('groups.fields.name.title')"
        :placeholder="group.name"
        :required="true"
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
  </fb-ui-modal-form>
</template>

<script>
import Group from '~/models/ui-node/Group'

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
        scope: 'groups_edit_name',
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
            required: this.$t('groups.fields.name.validation.required'),
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
        .then((result) => {
          if (result) {
            const errorMessage = this.$t('groups.messages.notEdited', {
              group: this.group.name,
            })

            Group.dispatch('edit', {
              id: this.group.id,
              data: this.form.model,
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
        name: this.group.name,
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
