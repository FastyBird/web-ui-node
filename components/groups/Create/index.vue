<template>
  <div class="fb-groups-create__container">
    <form @submit.prevent="submit">
      <fb-form-input
        v-model="form.model.name"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.name')"
        :has-error="errors.has(form.scope + '.name')"
        :name="'name'"
        :label="$t('groups.fields.name.title')"
        :required="true"
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

      <div class="fb-groups-create__icons">
        <div>
          <div
            v-for="(icon, index) in icons"
            :key="index"
          >
            <span
              :class="['fb-groups-create__icon', { 'fb-groups-create__icon-selected': form.model.icon === icon }]"
              @click.prevent="selectIcon(icon)"
            >
              <font-awesome-icon :icon="icon" />
            </span>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { groupIcons } from '~/configuration'
import Group from '~/models/ui-node/Group'

export default {

  name: 'GroupsCreate',

  props: {

    transparentBg: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      icons: groupIcons,
      form: {
        scope: 'groups_create',
        model: {
          title: null,
          comment: null,
          icon: null,
        },
      },
    }
  },

  created() {
    this.$validator.localize({
      en: {
        custom: {
          title: {
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

    selectIcon(icon) {
      this.form.model.icon = icon
    },

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
            const errorMessage = this.$t('groups.messages.notCreated')

            Group.dispatch('create', {
              data: this.form.model,
            })
              .catch((e) => {
                if (this._.get(e, 'exception', null) !== null) {
                  this.handleException(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })

            this._initModel()

            this.$emit('close')
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
      this.errors.clear(this.form.scope)
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
