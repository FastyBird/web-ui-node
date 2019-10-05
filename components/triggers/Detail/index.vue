<template>
  <div class="p-a-sm fb-triggers-detail__container">
    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.conditions') }}
    </h5>

    <div class="list-group m-b-sm">
      <component
        :is="conditionType(condition)"
        v-for="condition in trigger.conditions"
        :key="condition.id"
        :condition="condition"
        :removing-enabled="trigger.conditions.length > 1"
        class="list-group-item"
        @remove="removeCondition(condition)"
      />
    </div>

    <fb-button
      variant="outline-primary"
      size="sm"
      :class="['m-b-md', {'spinner': loading.condition, 'spinner-inverse': loading.condition, 'spinner-sm': loading.condition }]"
      @click.prevent="openView('condition')"
    >
      {{ $t('buttons.addCondition.title') }}
    </fb-button>

    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.actions') }}
    </h5>

    <div
      v-if="trigger.actions.length > 0"
      class="list-group m-b-sm"
    >
      <component
        :is="actionType(action)"
        v-for="action in trigger.actions"
        :key="action.id"
        :action="action"
        :removing-enabled="enabledRemovingActionNotification"
        class="list-group-item"
        @remove="removeAction(action)"
      />
    </div>

    <fb-button
      variant="outline-primary"
      size="sm"
      :class="['m-b-md', {'spinner': loading.action, 'spinner-inverse': loading.action, 'spinner-sm': loading.action }]"
      @click.prevent="openView('action')"
    >
      {{ $t('buttons.addAction.title') }}
    </fb-button>

    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.notifications') }}
    </h5>

    <div
      v-if="trigger.notifications.length > 0"
      class="list-group m-b-sm"
    >
      <component
        :is="notificationType(notification)"
        v-for="notification in trigger.notifications"
        :key="notification.id"
        :notification="notification"
        :removing-enabled="enabledRemovingActionNotification"
        class="list-group-item"
        @remove="removeNotification(notification)"
      />
    </div>

    <fb-button
      variant="outline-primary"
      size="sm"
      :class="['m-b-md', {'spinner': loading.notification, 'spinner-inverse': loading.notification, 'spinner-sm': loading.notification }]"
      @click.prevent="openView('notification')"
    >
      {{ $t('buttons.addNotification.title') }}
    </fb-button>

    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.generalSettings') }}
    </h5>

    <div class="list-group">
      <div class="list-group-item">
        <span class="pull-right">
          <switch-element
            ref="enabled"
            :status="form.model.enabled"
            @change="disableTrigger"
          />
        </span>
        {{ $t('buttons.enabled.title') }}
      </div>
      <button
        class="list-group-item"
        role="button"
        @click.prevent="openView('rename')"
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
        @click.prevent="openView('remove')"
      >
        <span class="pull-right"><font-awesome-icon icon="angle-right" /></span>
        <span
          v-show="loading.remove"
          class="spinner spinner-primary spinner-sm sq-18 pos-r m-r-md"
        />
        {{ $t('buttons.remove.title') }}
      </button>
    </div>

    <triggers-create-condition
      v-if="view.condition.show"
      :transparent-bg="transparentModal"
      @loaded="loading.condition = false"
      @add="addCondition"
      @close="closeView('condition')"
    />

    <triggers-create-action
      v-if="view.action.show"
      :transparent-bg="transparentModal"
      @loaded="loading.action = false"
      @add="addAction"
      @close="closeView('action')"
    />

    <triggers-create-notification
      v-if="view.notification.show"
      :transparent-bg="transparentModal"
      @loaded="loading.notification = false"
      @add="addNotification"
      @close="closeView('notification')"
    />

    <triggers-edit-rename
      v-if="view.rename.show"
      :trigger="trigger"
      :transparent-bg="transparentModal"
      @loaded="loading.rename = false"
      @close="closeView('rename')"
    />

    <triggers-remove
      v-if="view.remove.show"
      :trigger="trigger"
      :transparent-bg="transparentModal"
      @loaded="loading.remove = false"
      @close="closeView('remove')"
      @removed="itemRemoved"
    />

    <triggers-detail-refresh-confirm
      v-if="view.updateConfirm.show"
      :trigger="trigger"
      :transparent-bg="transparentModal"
      @loaded="loading.updateConfirm = false"
      @close="closeView('updateConfirm')"
      @refreshed="itemRefreshed"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  const TriggersDetailConditionChannelProperty = () => import('./ConditionChannelProperty')
  const TriggersDetailConditionThingProperty = () => import('./ConditionThingProperty')
  const TriggersDetailActionChannelProperty = () => import('./ActionChannelProperty')
  const TriggersDetailNotificationEmail = () => import('./NotificationEmail')
  const TriggersDetailNotificationSms = () => import('./NotificationSms')
  const TriggersDetailRefreshConfirm = () => import('./RefreshConfirm')
  const TriggersEditRename = () => import('../Edit/Rename')
  const TriggersRemove = () => import('../Remove')
  const TriggersCreateAction = () => import('../Create/Action')
  const TriggersCreateCondition = () => import('../Create/Condition')
  const TriggersCreateNotification = () => import('../Create/Notification')

  import SwitchElement from '@/components/layout/SwitchElement'

  export default {

    name: 'TriggersDetail',

    components: {
      TriggersDetailConditionThingProperty,
      TriggersDetailConditionChannelProperty,
      TriggersDetailActionChannelProperty,
      TriggersDetailNotificationEmail,
      TriggersDetailNotificationSms,
      TriggersDetailRefreshConfirm,

      TriggersEditRename,
      TriggersRemove,

      TriggersCreateAction,
      TriggersCreateCondition,
      TriggersCreateNotification,

      SwitchElement,
    },

    props: {

      trigger: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        transparentModal: false,
        loading: {
          condition: false,
          action: false,
          notification: false,
          rename: false,
          remove: false,
          updateConfirm: false,
        },
        view: {
          condition: {
            show: false,
          },
          action: {
            show: false,
          },
          notification: {
            show: false,
          },
          rename: {
            show: false,
          },
          remove: {
            show: false,
          },
          updateConfirm: {
            show: false,
          },
        },
        form: {
          scope: 'triggers_settings',
          model: {
            enabled: true,
          },
        },
      }
    },

    computed: {

      ...mapState('entities', {
        queue: state => state.trigger.queue,
      }),

      /**
       * Check if remove item is enabled
       *
       * @returns {boolean}
       */
      enabledRemovingActionNotification() {
        return !(
          (this.trigger.actions.length <= 1 && this.trigger.notifications.length < 1)
          || (this.trigger.notifications.length <= 1 && this.trigger.actions.length < 1)
        )
      },

    },

    watch: {

      trigger(val) {
        this.form.model.enabled = val.enabled
      },

      'queue.update'(val) {
        for (const item of val) {
          if (item === this.trigger.id) {
            this.openView('updateConfirm')
          }
        }
      },

    },

    created() {
      this.transparentModal = this.$parent.$options.name !== 'Layout'

      this.form.model.enabled = this.trigger.enabled
    },

    beforeMount() {
      if (!this.$store.getters['entities/thing/firstLoadFinished']()) {
        this.$store.dispatch('entities/thing/fetch', {
          include_channels: true,
        }, {
          root: true,
        })
          .catch(e => {
            // eslint-disable-next-line
            console.log(e)
          })
      }
    },

    mounted() {
      this.$store.dispatch('entities/trigger/lockForEditing', {
        id: this.trigger.id,
      }, {
        root: true,
      })
        .catch(() => {
          // Something wen wrong
        })
    },

    destroyed() {
      this.$store.dispatch('entities/trigger/unlockForEditing', {
        id: this.trigger.id,
      }, {
        root: true,
      })
        .catch(() => {
          // Something wen wrong
        })
    },

    methods: {

      /**
       * Determine component type for condition
       *
       * @param {Object} condition
       *
       * @returns {(String|null)}
       */
      conditionType(condition) {
        if (condition.isThingProperty) {
          return 'TriggersDetailConditionThingProperty'
        } else if (condition.isChannelProperty) {
          return 'TriggersDetailConditionChannelProperty'
        }

        return null
      },

      /**
       * Determine component type for action
       *
       * @param {Object} action
       *
       * @returns {(String|null)}
       */
      actionType(action) {
        if (action.isThingProperty) {
          return 'TriggersDetailActionThingProperty'
        } else if (action.isChannelProperty) {
          return 'TriggersDetailActionChannelProperty'
        }

        return null
      },

      /**
       * Determine component type for notification
       *
       * @param {Object} notification
       *
       * @returns {(String|null)}
       */
      notificationType(notification) {
        if (
          notification.isEmail
          || notification.isCustomEmail
        ) {
          return 'TriggersDetailNotificationEmail'
        } else if (notification.isSms) {
          return 'TriggersDetailNotificationSms'
        }

        return null
      },

      /**
       * Open trigger edit form
       *
       * @param {String} type
       */
      openView(type) {
        this.view[type].show = true

        if (this.loading.hasOwnProperty(type)) {
          this.loading[type] = true
        }
      },

      /**
       * Close trigger edit window
       *
       * @param {String} type
       */
      closeView(type) {
        this.view[type].show = false
      },

      /**
       * Fired when opened item is removed
       */
      itemRemoved() {
        this.closeView('remove')

        this.$emit('removed')
      },

      itemRefreshed() {
        this.closeView('updateConfirm')
      },

      /**
       * Add new condition to trigger
       *
       * @param {Object} data
       */
      addCondition(data) {
        const errorMessage = this.$t('messages.conditionNotAdded')

        this.$store.dispatch('entities/condition/add', {
          trigger: this.trigger,
          data,
        }, {
          root: true,
        })
          .catch(e => {
            console.log(e)
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

        this.closeView('condition')

        this.$toasted.success(this.$t('messages.conditionAdded'), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })
      },

      /**
       * Remove condition from trigger
       *
       * @param {Object} condition
       */
      removeCondition(condition) {
        if (this.trigger.conditions.length <= 1) {
          this.$toasted.error(this.$t('messages.minimumConditions'), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        const errorMessage = this.$t('messages.conditionNotRemoved')

        this.$store.dispatch('entities/condition/remove', {
          id: condition.id,
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

        this.$toasted.success(this.$t('messages.conditionRemoved'), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })
      },

      /**
       * Add new action to trigger
       *
       * @param {Object} data
       */
      addAction(data) {
        const errorMessage = this.$t('messages.actionNotAdded')

        this.$store.dispatch('entities/action/add', {
          trigger: this.trigger,
          data,
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

        this.closeView('action')

        this.$toasted.success(this.$t('messages.actionAdded'), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })
      },

      /**
       * Remove action from trigger
       *
       * @param {Object} action
       */
      removeAction(action) {
        if (!this.enabledRemovingActionNotification) {
          this.$toasted.error(this.$t('messages.minimumActionsNotification'), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        const errorMessage = this.$t('messages.actionNotRemoved')

        this.$store.dispatch('entities/action/remove', {
          id: action.id,
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

        this.$toasted.success(this.$t('messages.actionRemoved'), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })
      },

      /**
       * Add new notification to trigger
       *
       * @param {Object} data
       */
      addNotification(data) {
        const errorMessage = this.$t('messages.notificationNotAdded')

        this.$store.dispatch('entities/notification/add', {
          trigger: this.trigger,
          data,
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

        this.closeView('notification')

        this.$toasted.success(this.$t('messages.notificationAdded'), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })
      },

      /**
       * Remove notification from trigger
       *
       * @param {Object} notification
       */
      removeNotification(notification) {
        if (!this.enabledRemovingActionNotification) {
          this.$toasted.error(this.$t('messages.minimumActionsNotification'), {
            action: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })

          return
        }

        const errorMessage = this.$t('messages.notificationNotRemoved')

        this.$store.dispatch('entities/notification/remove', {
          id: notification.id,
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

        this.$toasted.success(this.$t('messages.notificationRemoved'), {
          action: {
            text: this.$t('application.buttons.close.title'),
            onClick: (evnt, toastObject) => {
              toastObject.goAway(0)
            },
          },
        })
      },

      /**
       * Disable trigger
       */
      disableTrigger() {
        this.form.model.enabled = !this.form.model.enabled

        this.submit()
      },

      /**
       * Update trigger details
       */
      submit() {
        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              const errorMessage = this.$t('messages.notEdited', {
                trigger: this.form.model.name,
              })

              this.$store.dispatch('entities/trigger/edit', {
                id: this.trigger.id,
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
                trigger: this.form.model.name,
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

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
