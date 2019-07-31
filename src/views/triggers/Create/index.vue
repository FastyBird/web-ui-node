<template>
  <layout name="LayoutDefault">
    <div class="fb-triggers-create-view__container">
      <form
        v-if="!$store.state.entities.trigger.semaphore.fetching.items"
        @submit.prevent="submit"
      >
        <fb-md-form-input
          v-model="form.model.name"
          v-validate="'required'"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.name')"
          :has-error="errors.has(form.scope + '.name')"
          :name="'name'"
          :label="$t('field.name.title')"
          :required="true"
          :tab-index="1"
        />

        <fb-md-form-text-area
          v-model="form.model.comment"
          :data-vv-scope="form.scope"
          :error="errors.first(form.scope + '.comment')"
          :has-error="errors.has(form.scope + '.comment')"
          :name="'comment'"
          :label="$t('field.comment.title')"
          :tab-index="2"
          class="m-b-0"
        />

        <div class="row m-t-md">
          <div class="col-md-6">
            <fb-card-box>
              <strong
                slot="header"
                class="fz-lg"
              >{{ $t('texts.if') }}</strong>
              <template slot="body">
                <ul
                  v-if="form.model.conditions.length"
                  class="media-list"
                >
                  <triggers-create-list-condition
                    v-for="(condition, index) in form.model.conditions"
                    :key="index"
                    :condition="condition"
                    @remove="removeCondition(index)"
                  />
                </ul>

                <fb-button
                  block
                  variant="outline-primary"
                  size="sm"
                  @click.prevent="openView('condition')"
                >
                  {{ $t('buttons.addCondition.title') }}
                </fb-button>
              </template>
            </fb-card-box>
          </div>

          <div class="col-md-6">
            <fb-card-box>
              <strong
                slot="header"
                class="fz-lg"
              >{{ $t('texts.then') }}</strong>
              <template slot="body">
                <ul
                  v-if="form.model.actions.length || form.model.notifications.length"
                  class="media-list"
                >
                  <triggers-create-list-action
                    v-for="(action, index) in form.model.actions"
                    :key="`a-${index}`"
                    :action="action"
                    @remove="removeAction(index)"
                  />

                  <triggers-create-list-notification
                    v-for="(notification, index) in form.model.notifications"
                    :key="`n-${index}`"
                    :notification="notification"
                    @remove="removeNotification(index)"
                  />
                </ul>

                <div class="pos-r">
                  <div class="row">
                    <div class="col-sm-6">
                      <fb-button
                        block
                        variant="outline-primary"
                        size="sm"
                        @click.prevent="openView('action')"
                      >
                        {{ $t('buttons.addAction.title') }}
                      </fb-button>
                    </div>
                    <div class="divider divider-vertical hidden-xs">
                      <div class="divider-content text-uppercase">
                        {{ $t('texts.or') }}
                      </div>
                    </div>
                    <div class="divider visible-xs text-center col-12">
                      <div class="divider-content text-uppercase">
                        {{ $t('texts.or') }}
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <fb-button
                        block
                        variant="outline-primary"
                        size="sm"
                        @click.prevent="openView('notification')"
                      >
                        {{ $t('buttons.addNotification.title') }}
                      </fb-button>
                    </div>
                  </div>
                </div>
              </template>
            </fb-card-box>
          </div>
        </div>

        <hr>

        <fb-button
          uppercase
          variant="primary"
          size="sm"
          @click.prevent="submit"
        >
          {{ $t('application.buttons.save.title') }}
        </fb-button>
        <fb-button
          uppercase
          variant="link"
          size="sm"
          name="close"
          class="text-muted"
          @click.prevent="closeCreate"
        >
          {{ $t('application.buttons.close.title') }}
        </fb-button>

        <triggers-create-condition
          v-if="view.condition.show"
          @add="addCondition"
          @close="closeView('condition')"
        />

        <triggers-create-action
          v-if="view.action.show"
          @add="addAction"
          @close="closeView('action')"
        />

        <triggers-create-notification
          v-if="view.notification.show"
          @add="addNotification"
          @close="closeView('notification')"
        />
      </form>

      <fb-loading-box
        v-if="$store.state.entities.trigger.semaphore.fetching.items"
        :text="$t('texts.loading')"
      />
    </div>
  </layout>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import { TRIGGERS_LIST_LINK } from '@/router'

  const TriggersCreateAction = () => import('@/components/triggers/Create/Action')
  const TriggersCreateCondition = () => import('@/components/triggers/Create/Condition')
  const TriggersCreateNotification = () => import('@/components/triggers/Create/Notification')
  const TriggersCreateListAction = () => import('@/components/triggers/Create/ListAction')
  const TriggersCreateListCondition = () => import('@/components/triggers/Create/ListCondition')
  const TriggersCreateListNotification = () => import('@/components/triggers/Create/ListNotification')

  export default {

    name: 'TriggerCreateView',

    components: {
      TriggersCreateAction,
      TriggersCreateCondition,
      TriggersCreateListAction,
      TriggersCreateListCondition,
      TriggersCreateNotification,
      TriggersCreateListNotification,
    },

    data() {
      return {
        form: {
          scope: 'triggers_create',
          model: {
            name: '',
            comment: '',
            conditions: [],
            actions: [],
            notifications: [],
          },
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
        },
      }
    },

    computed: {

      ...mapState({
        route: state => state.route,
      }),

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

    },

    watch: {

      windowSize() {
        this._configureHeader()
      },

    },

    created() {
      this._configureHeader()

      this.$validator.localize({
        en: {
          custom: {
            name: {
              required: this.$t('field.name.validation.required'),
            },
          },
        },
      })
    },

    methods: {

      ...mapActions('header', [
        'setHeading',
        'setLeftButton',
        'setRightButton',
        'resetStore',
      ]),

      submit() {
        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              if (this.form.model.conditions.length <= 0) {
                this.$toasted.error(this.$t('messages.missingCondition'), {
                  action: {
                    text: this.$t('application.buttons.close.title'),
                    onClick: (evnt, toastObject) => {
                      toastObject.goAway(0)
                    },
                  },
                })

                return
              }

              if (this.form.model.actions.length <= 0 && this.form.model.notifications.length <= 0) {
                this.$toasted.error(this.$t('messages.missingActionOrNotification'), {
                  action: {
                    text: this.$t('application.buttons.close.title'),
                    onClick: (evnt, toastObject) => {
                      toastObject.goAway(0)
                    },
                  },
                })

                return
              }

              const errorMessage = this.$t('messages.notCreated', {
                trigger: this.form.model.name,
              })

              this.$store.dispatch('entities/trigger/add', {
                automatic: true,
                direct: false,
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

              this.$toasted.success(this.$t('messages.created', {
                trigger: this.form.model.name,
              }), {
                action: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })

              this.$router.push(TRIGGERS_LIST_LINK)
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

      closeCreate() {
        this.$router.push(TRIGGERS_LIST_LINK)
      },

      /**
       * Add condition settings to collection
       *
       * @param {Object} data
       */
      addCondition(data) {
        for (const condition of this.form.model.conditions) {
          if (JSON.stringify(condition) === JSON.stringify(data)) {
            this.$toasted.error(this.$t('messages.sameConditionAdded'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })

            return
          }
        }

        this.form.model.conditions.push(data)

        this.closeView('condition')
      },

      /**
       * Remove condition settings from collection
       *
       * @param {Number} index
       */
      removeCondition(index) {
        this.form.model.conditions.splice(index, 1)
      },

      /**
       * Add action settings to collection
       *
       * @param {Object} data
       */
      addAction(data) {
        for (const action of this.form.model.actions) {
          if (JSON.stringify(action) === JSON.stringify(data)) {
            this.$toasted.error(this.$t('messages.sameActionAdded'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })

            return
          } else if (action.channel === data.channel) {
            this.$toasted.error(this.$t('messages.sameActionChannelAdded'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })

            return
          }
        }

        this.form.model.actions.push(data)

        this.closeView('action')
      },

      /**
       * Remove action settings from collection
       *
       * @param {Number} index
       */
      removeAction(index) {
        this.form.model.actions.splice(index, 1)
      },

      /**
       * Add notification settings to collection
       *
       * @param {Object} data
       */
      addNotification(data) {
        for (const notification of this.form.model.notifications) {
          if (JSON.stringify(notification) === JSON.stringify(data)) {
            this.$toasted.error(this.$t('messages.sameNotificationAdded'), {
              action: {
                text: this.$t('application.buttons.close.title'),
                onClick: (evnt, toastObject) => {
                  toastObject.goAway(0)
                },
              },
            })

            return
          }
        }

        this.form.model.notifications.push(data)

        this.closeView('notification')
      },

      /**
       * Remove notification settings from collection
       *
       * @param {Number} index
       */
      removeNotification(index) {
        this.form.model.notifications.splice(index, 1)
      },

      /**
       * Open triggers view
       *
       * @param {String} view
       * @param {Object} [item]
       */
      openView(view, item) {
        if (this.view.hasOwnProperty(view)) {
          this.view[view].show = true

          if (this.view[view].hasOwnProperty('item') && typeof item !== 'undefined') {
            this.view[view].item = item
          }
        }
      },

      /**
       * Close triggers view window
       *
       * @param {String} view
       */
      closeView(view) {
        if (this.view.hasOwnProperty(view)) {
          this.view[view].show = false

          if (this.view[view].hasOwnProperty('item')) {
            this.view[view].item = null
          }
        }
      },

      /**
       * Configure page header for small devices
       *
       * @private
       */
      _configureHeader() {
        this.resetStore()

        this.setHeading({
          heading: this.$t('headings.create'),
        })

        if (this.windowSize === 'xs' || this.windowSize === 'sm') {
          this.setLeftButton({
            name: this.$t('application.buttons.close.title'),
            icon: 'times',
            link: TRIGGERS_LIST_LINK,
          })
        }
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import './index.scss';
</style>

<i18n src="./locales.json" />
