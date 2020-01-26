<template>
  <div class="fb-routines-settings-routine__container">
    <list-items-container :heading="$t('routines.headings.generalSettings')">
      <settings-list-item class="fb-routines-settings-routine__item">
        <fb-switch-element
          ref="enabled"
          :status="form.model.enabled"
          variant="primary"
          @change="toggleRoutineState"
        />
        <template v-if="routine.enabled">
          {{ $t('routines.buttons.enabled.title') }}
        </template>
        <template v-else>
          {{ $t('routines.buttons.disabled.title') }}
        </template>
      </settings-list-item>

      <settings-list-item
        type="button"
        class="fb-routines-settings-routine__item"
        @click="openWindow('rename')"
      >
        <span class="fb-routines-settings-routine__item-icon">
          <font-awesome-icon icon="angle-right" />
        </span>
        <fb-spinner
          v-if="loading.rename"
          size="sm"
        />
        {{ $t('routines.buttons.rename.title') }}
      </settings-list-item>

      <settings-list-item
        type="button"
        class="fb-routines-settings-routine__item fb-routines-settings-routine__item-remove"
        @click="openWindow('remove')"
      >
        <span class="fb-routines-settings-routine__item-icon">
          <font-awesome-icon icon="exclamation-triangle" />
        </span>
        <fb-spinner
          v-if="loading.remove"
          size="sm"
        />
        {{ $t('routines.buttons.remove.title') }}
      </settings-list-item>
    </list-items-container>

    <routine-rename
      v-if="rename.show"
      :routine="routine"
      :transparent-bg="transparentModal"
      @loaded="loading.rename = false"
      @close="closeWindow('rename')"
    />

    <routine-remove
      v-if="remove.show"
      :routine="routine"
      :transparent-bg="transparentModal"
      @loaded="loading.remove = false"
      @close="closeWindow('remove')"
      @removed="routineRemoved"
    />
  </div>
</template>

<script>
const RoutineRename = () => import('./Rename')
const RoutineRemove = () => import('./Remove')

export default {

  name: 'RoutinesSettingsRoutine',

  components: {
    RoutineRename,
    RoutineRemove,
  },

  props: {

    routine: {
      type: Object,
      required: true,
    },

  },

  data() {
    return {
      transparentModal: false,
      loading: {
        rename: false,
        remove: false,
      },
      rename: {
        show: false,
      },
      remove: {
        show: false,
      },
      form: {
        scope: 'routines_settings',
        model: {
          enabled: true,
        },
      },
    }
  },

  created() {
    this.transparentModal = this.$parent.$options.name !== 'Layout'

    this.form.model.enabled = this.routine.enabled
  },

  methods: {

    /**
     * Open edit|info window
     *
     * @param {String} window
     */
    openWindow(window) {
      if (Object.prototype.hasOwnProperty.call(this, window)) {
        this[window].show = true

        if (Object.prototype.hasOwnProperty.call(this.loading, window)) {
          this.loading[window] = true
        }
      }
    },

    /**
     * Close opened window
     *
     * @param {String} window
     */
    closeWindow(window) {
      if (Object.prototype.hasOwnProperty.call(this, window)) {
        this[window].show = false
      }
    },

    /**
     * Disable routine
     */
    toggleRoutineState() {
      this.form.model.enabled = !this.form.model.enabled

      this.submit()
    },

    /**
     * Update routine details
     */
    submit() {
      this.$validator.validateAll(this.form.scope)
        .then((result) => {
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
              .catch((e) => {
                if (Object.prototype.hasOwnProperty.call(e, 'exception')) {
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })
          }
        })
        .catch((e) => {
          if (Object.prototype.hasOwnProperty.call(this, '$sentry')) {
            this.$sentry.captureException(e)
          }
        })
    },

    /**
     * Fired when opened item is removed
     */
    routineRemoved() {
      this.closeWindow('remove')

      this.$emit('removed')
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
