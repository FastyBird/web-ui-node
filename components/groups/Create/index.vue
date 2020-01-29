<template>
  <div class="fb-iot-groups-create__container">
    <form @submit.prevent="submit">
      <fb-form-input
        v-model="form.model.title"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.title')"
        :has-error="errors.has(form.scope + '.title')"
        :name="'title'"
        :label="$t('groups.fields.title.title')"
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

      <div class="fb-iot-groups-create__icons">
        <div>
          <div
            v-for="(icon, index) in icons"
            :key="index"
          >
            <span
              :class="['fb-iot-groups-create__icon', { 'fb-iot-groups-create__icon-selected': form.model.icon === icon }]"
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
import { groupIcons } from '@/configuration'

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
        scope: 'io_server_group_create',
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

            this.$store.dispatch('entities/group/create', {
              data: this.form.model,
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
