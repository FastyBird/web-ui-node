<template>
  <div class="p-a-sm fb-routines-settings-routine__container">
    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.generalSettings') }}
    </h5>

    <div class="list-group">
      <div class="list-group-item">
        <span class="pull-right">
          <switch-element
            ref="enabled"
            :status="form.model.enabled"
            @change="disableRoutine"
          />
        </span>
        {{ $t('buttons.enabled.title') }}
      </div>
      <button
        class="list-group-item"
        role="button"
        @click.prevent="openWindow('rename')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.rename"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.rename.title') }}
      </button>
      <button
        class="list-group-item text-danger"
        role="button"
        @click.prevent="openWindow('remove')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.remove"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.remove.title') }}
      </button>
    </div>

    <routines-edit-routine-rename
      v-if="rename.show"
      :routine="routine"
      :transparent-bg="transparentModal"
      @loaded="loading.rename = false"
      @close="closeWindow('rename')"
    />

    <routines-remove
      v-if="remove.show"
      :routine="routine"
      :transparent-bg="transparentModal"
      @loaded="loading.remove = false"
      @close="closeWindow('remove')"
    />
  </div>
</template>

<script>
  const RoutinesEditRoutineRename = () => import('../Edit/Rename')
  const RoutinesRemove = () => import('../Remove')

  import SwitchElement from '@/components/layout/SwitchElement'

  export default {

    name: 'RoutinesSettingsRoutine',

    components: {
      RoutinesEditRoutineRename,
      RoutinesRemove,

      SwitchElement,
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
        if (this.hasOwnProperty(window)) {
          this[window].show = true

          if (this.loading.hasOwnProperty(window)) {
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
        if (this.hasOwnProperty(window)) {
          this[window].show = false
        }
      },

      /**
       * Open routine edit form
       *
       * @param {String} type
       * @param {ThingConfiguration} [parameter]
       */
      openForm(type, parameter) {
        this[type].show = true

        if (parameter !== null) {
          this[type].parameter = parameter
        }

        if (this.loading.hasOwnProperty(type)) {
          if (parameter !== undefined) {
            this.loading.parameterForm[parameter.name] = true
          } else {
            this.loading[type] = true
          }
        }
      },

      /**
       * Close routine edit window
       *
       * @param {Object} event
       * @param {String} type
       */
      closeForm(event, type) {
        event && event.preventDefault()

        this[type].show = false
      },

      /**
       * Disable routine
       */
      disableRoutine() {
        this.form.model.enabled = !this.form.model.enabled

        this.submit()
      },

      /**
       * Update routine details
       */
      submit() {
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
       * Fired when opened item is removed
       */
      itemRemoved() {
        this.closeView('remove')

        this.$emit('removed')
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
