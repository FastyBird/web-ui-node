<template>
  <div class="p-a-sm fb-routines-detail__container">
    <h5 class="fw-b text-capitalize text-primary">
      {{ $t('headings.conditions') }}
    </h5>

    <div class="list-group m-b-sm">
      <component
        :is="conditionType(condition)"
        v-for="condition in routine.conditions"
        :key="condition.id"
        :condition="condition"
        :removing-enabled="routine.conditions.length > 1"
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
      v-if="routine.actions.length > 0"
      class="list-group m-b-sm"
    >
      <component
        :is="actionType(action)"
        v-for="action in routine.actions"
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
      v-if="routine.notifications.length > 0"
      class="list-group m-b-sm"
    >
      <component
        :is="notificationType(notification)"
        v-for="notification in routine.notifications"
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

    <routines-create-notification
      v-if="view.notification.show"
      :transparent-bg="transparentModal"
      @loaded="loading.notification = false"
      @add="addNotification"
      @close="closeView('notification')"
    />

    <routines-detail-refresh-confirm
      v-if="view.updateConfirm.show"
      :routine="routine"
      :transparent-bg="transparentModal"
      @loaded="loading.updateConfirm = false"
      @close="closeView('updateConfirm')"
      @refreshed="itemRefreshed"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  const RoutinesDetailConditionChannelProperty = () => import('./ConditionChannelProperty')
  const RoutinesDetailConditionThingProperty = () => import('./ConditionThingProperty')
  const RoutinesDetailActionChannelProperty = () => import('./ActionChannelProperty')
  const RoutinesDetailNotificationEmail = () => import('./NotificationEmail')
  const RoutinesDetailNotificationSms = () => import('./NotificationSms')
  const RoutinesDetailRefreshConfirm = () => import('./RefreshConfirm')
  const RoutinesCreateNotification = () => import('../Create/Notification')

  export default {

    name: 'RoutinesDetail',

    components: {
      RoutinesDetailConditionThingProperty,
      RoutinesDetailConditionChannelProperty,
      RoutinesDetailActionChannelProperty,
      RoutinesDetailNotificationEmail,
      RoutinesDetailNotificationSms,
      RoutinesDetailRefreshConfirm,

      RoutinesCreateNotification,
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
          condition: false,
          action: false,
          notification: false,
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
          updateConfirm: {
            show: false,
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
          (this.routine.actions.length <= 1 && this.routine.notifications.length < 1)
          || (this.routine.notifications.length <= 1 && this.routine.actions.length < 1)
        )
      },

    },

    watch: {

      routine(val) {
        this.form.model.enabled = val.enabled
      },

      'queue.update'(val) {
        for (const item of val) {
          if (item === this.routine.id) {
            this.openView('updateConfirm')
          }
        }
      },

    },

    created() {
      this.transparentModal = this.$parent.$options.name !== 'Layout'
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
        id: this.routine.id,
      }, {
        root: true,
      })
        .catch(() => {
          // Something wen wrong
        })
    },

    destroyed() {
      this.$store.dispatch('entities/trigger/unlockForEditing', {
        id: this.routine.id,
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
          return 'RoutinesDetailConditionThingProperty'
        } else if (condition.isChannelProperty) {
          return 'RoutinesDetailConditionChannelProperty'
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
          return 'RoutinesDetailActionThingProperty'
        } else if (action.isChannelProperty) {
          return 'RoutinesDetailActionChannelProperty'
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
          return 'RoutinesDetailNotificationEmail'
        } else if (notification.isSms) {
          return 'RoutinesDetailNotificationSms'
        }

        return null
      },

      /**
       * Open routine edit form
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
       * Close routine edit window
       *
       * @param {String} type
       */
      closeView(type) {
        this.view[type].show = false
      },

      itemRefreshed() {
        this.closeView('updateConfirm')
      },

      /**
       * Add new condition to routine
       *
       * @param {Object} data
       */
      addCondition(data) {
        const errorMessage = this.$t('messages.conditionNotAdded')

        this.$store.dispatch('entities/condition/add', {
          routine: this.routine,
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
       * Remove condition from routine
       *
       * @param {Object} condition
       */
      removeCondition(condition) {
        if (this.routine.conditions.length <= 1) {
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
       * Add new action to routine
       *
       * @param {Object} data
       */
      addAction(data) {
        const errorMessage = this.$t('messages.actionNotAdded')

        this.$store.dispatch('entities/action/add', {
          routine: this.routine,
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
       * Remove action from routine
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
       * Add new notification to routine
       *
       * @param {Object} data
       */
      addNotification(data) {
        const errorMessage = this.$t('messages.notificationNotAdded')

        this.$store.dispatch('entities/notification/add', {
          routine: this.routine,
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
       * Remove notification from routine
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

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
