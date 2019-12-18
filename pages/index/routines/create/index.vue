<template>
  <div class="fb-routines-create-view__container">
    <form
      v-show="view.opened === null"
      @submit.prevent="submit"
    >
      <fb-form-input
        v-model="form.model.name"
        v-validate="'required'"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.name')"
        :has-error="errors.has(form.scope + '.name')"
        :name="'name'"
        :label="$t('routines.fields.name.title')"
        :required="true"
        :tab-index="1"
      />

      <fb-form-text-area
        v-model="form.model.comment"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.comment')"
        :has-error="errors.has(form.scope + '.comment')"
        :name="'comment'"
        :label="$t('routines.fields.comment.title')"
        :tab-index="2"
      />

      <h3 class="fb-routines-create-view__heading">
        {{ $t('routines.headings.addCondition') }}
      </h3>

      <fb-button
        variant="outline-default"
        block
        @click="openView(view.items.condition.name)"
      >
        <font-awesome-icon icon="plus-circle" />
        <span>{{ $t('routines.buttons.addThing.title') }}</span>
      </fb-button>

      <template v-if="view.opened === null">
        <list-condition
          v-for="(condition, index) in conditions"
          :key="`c-${index}`"
          :condition="condition"
          class="fb-routines-create-view__conditions-container"
          @edit="editCondition(index)"
          @toggle="toggleConditionState(index)"
        />
      </template>

      <hr>

      <h3 class="fb-routines-create-view__heading">
        {{ $t('routines.headings.addAction') }}
      </h3>

      <fb-button
        variant="outline-default"
        block
        @click="openView(view.items.action.name)"
      >
        <font-awesome-icon icon="plus-circle" />
        <span>{{ $t('routines.buttons.addThing.title') }}</span>
      </fb-button>

      <template v-if="view.opened === null">
        <list-action
          v-for="(action, index) in actions"
          :key="`a-${index}`"
          :action="action"
          class="fb-routines-create-view__actions-container"
          @edit="editAction(index)"
          @toggle="toggleActionState(index)"
        />
      </template>

      <fb-button
        variant="primary"
        size="lg"
        block
        mobile
        @click="submit"
      >
        {{ $t('routines.buttons.save.title') }}
        <font-awesome-icon icon="plus" />
      </fb-button>
    </form>

    <select-thing
      v-if="view.opened === view.items.action.name || view.opened === view.items.condition.name"
      :items="view.items[view.opened].items"
      :only-settable="view.opened === view.items.action.name"
      @select="thingSelected"
      @close="closeView(view.opened)"
    />

    <edit-condition
      v-if="view.opened === view.items.conditionThing.name"
      :thing="view.items.conditionThing.thing"
      @add="addCondition"
      @remove="removeCondition"
      @back="openView(view.items.condition.name)"
      @close="closeView(view.items.conditionThing.name)"
    />

    <edit-condition
      v-if="view.opened === view.items.conditionThingEdit.name"
      :thing="view.items.conditionThingEdit.thing"
      :condition="view.items.conditionThingEdit.item"
      @add="addCondition"
      @remove="removeCondition"
      @back="closeView(view.items.conditionThingEdit.name)"
      @close="closeView(view.items.conditionThingEdit.name)"
    />

    <edit-action
      v-if="view.opened === view.items.actionThing.name"
      :thing="view.items.actionThing.thing"
      @add="addAction"
      @remove="removeAction"
      @back="openView(view.items.action.name)"
      @close="closeView(view.items.actionThing.name)"
    />

    <edit-action
      v-if="view.opened === view.items.actionThingEdit.name"
      :thing="view.items.actionThingEdit.thing"
      :action="view.items.actionThingEdit.item"
      @add="addAction"
      @remove="removeAction"
      @back="closeView(view.items.actionThingEdit.name)"
      @close="closeView(view.items.actionThingEdit.name)"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import {
    ROUTINES_HASH_CREATE,
  } from '@/configuration/routes'

  const SelectThing = () => import('@/components/routines/Edit/SelectThing')

  const ListCondition = () => import('@/components/routines/Edit/ListCondition')
  const EditCondition = () => import('@/components/routines/Edit/EditCondition')
  const ListAction = () => import('@/components/routines/Edit/ListAction')
  const EditAction = () => import('@/components/routines/Edit/EditAction')

  export default {

    name: 'RoutineCreatePage',

    components: {
      SelectThing,

      ListCondition,
      EditCondition,
      ListAction,
      EditAction,
    },

    transition: 'fade',

    data() {
      return {
        form: {
          scope: 'routines_create',
          model: {
            name: '',
            comment: '',
            conditions: [],
            actions: [],
            notifications: [],
          },
        },
        view: {
          opened: null,
          items: {
            condition: {
              name: 'condition',
              items: [],
            },
            conditionThing: {
              name: 'conditionThing',
              thing: null,
            },
            conditionThingEdit: {
              name: 'conditionThingEdit',
              thing: null,
              item: null,
            },
            action: {
              name: 'action',
              items: [],
            },
            actionThing: {
              name: 'actionThing',
              thing: null,
            },
            actionThingEdit: {
              name: 'actionThingEdit',
              thing: null,
              item: null,
            },
            notification: {
              name: 'notification',
            },
          },
        },
      }
    },

    computed: {

      ...mapState('theme', {
        windowSize: state => state.windowSize,
      }),

      /**
       * Get all assigned conditions
       *
       * @returns {Array}
       */
      conditions() {
        return this._sortItemsThings(this._.get(this.form.model, 'conditions', []))
      },

      /**
       * Get all assigned actions
       *
       * @returns {Array}
       */
      actions() {
        return this._sortItemsThings(this._.get(this.form.model, 'actions', []))
      },

    },

    watch: {

      windowSize() {
        this._configureNavigation()
      },

    },

    fetch({ app, store }) {
      store.dispatch('header/resetStore', null, {
        root: true,
      })

      store.dispatch('header/setLeftButton', {
        name: app.i18n.t('application.buttons.back.title'),
        link: app.localePath(app.$routes.routines.list),
        icon: 'arrow-left',
      }, {
        root: true,
      })

      store.dispatch('header/hideRightButton', null, {
        root: true,
      })

      store.dispatch('header/setFullRowHeading', null, {
        root: true,
      })

      store.dispatch('header/setHeading', {
        heading: app.i18n.t('application.headings.routines.add'),
      }, {
        root: true,
      })

      store.dispatch('header/setHeadingIcon', {
        icon: 'project-diagram',
      }, {
        root: true,
      })

      store.dispatch('bottomNavigation/resetStore', null, {
        root: true,
      })

      store.dispatch('bottomNavigation/hideNavigation', null, {
        root: true,
      })
    },

    beforeMount() {
      if (this.windowSize !== null && this.windowSize !== 'xs') {
        this.$router.push(this.localePath({
          name: this.$routes.routines.list,
          hash: `${ROUTINES_HASH_CREATE}`,
        }))

        return
      }

      this._configureNavigation()

      this.$validator.localize({
        en: {
          custom: {
            name: {
              required: this.$t('routines.fields.name.validation.required'),
            },
          },
        },
      })
    },

    methods: {

      /**
       * Condition or action thing is selected, opening properties select
       *
       * @param {Thing} thing
       */
      thingSelected(thing) {
        if (this.view.opened === this.view.items.action.name) {
          this.view.items.actionThing.thing = thing

          this.openView(this.view.items.actionThing.name)
        } else if (this.view.opened === this.view.items.condition.name) {
          this.view.items.conditionThing.thing = thing

          this.openView(this.view.items.conditionThing.name)
        }
      },

      /**
       * CONDITIONS
       */

      /**
       * Add condition settings to collection
       *
       * @param {Object} data
       */
      addCondition(data) {
        this.closeView(this.view.items.conditionThing.name)

        for (const index in this.form.model.conditions) {
          if (this.form.model.conditions.hasOwnProperty(index)) {
            if (JSON.stringify(this.form.model.conditions[index]) === JSON.stringify(data)) {
              // Same condition added, nothing to do
              return
            } else if (this.form.model.conditions[index].thing === data.thing) {
              // Conditions thing is updated
              this.form.model.conditions[index] = data

              return
            }
          }
        }

        this.form.model.conditions.push(data)
      },

      /**
       * Open edit routine action window
       *
       * @param {Number} index
       */
      editCondition(index) {
        if (this.form.model.conditions.hasOwnProperty(index)) {
          this.view.items.conditionThingEdit.thing = this.$store.getters['entities/thing/query']()
            .with('device')
            .with('channel')
            .with('channel.properties')
            .where('id', this.form.model.conditions[index].thing)
            .first()

          if (this.form.model.conditions.hasOwnProperty(index)) {
            this.view.items.conditionThingEdit.item = this.form.model.conditions[index]
          }

          this.openView(this.view.items.conditionThingEdit.name)
        }
      },

      /**
       * Change action state
       *
       * @param {Number} index
       */
      toggleConditionState(index) {
        if (this.form.model.conditions.hasOwnProperty(index)) {
          this.form.model.conditions[index].enabled = !this.form.model.conditions[index].enabled
        }
      },

      /**
       * Remove action settings from collection
       *
       * @param {Thing} thing
       */
      removeCondition(thing) {
        for (const index in this.form.model.conditions) {
          if (
            this.form.model.conditions.hasOwnProperty(index) &&
            this.form.model.conditions[index].thing === thing.id
          ) {
            this.form.model.conditions.splice(index, 1)
          }
        }

        if (this.view.opened === this.view.items.conditionThingEdit.name) {
          this.closeView(this.view.items.conditionThingEdit.name)
        } else {
          this.openView(this.view.items.condition.name)
        }
      },

      /**
       * ACTIONS
       */

      /**
       * Add action settings to collection
       *
       * @param {Object} data
       */
      addAction(data) {
        this.closeView(this.view.items.actionThing.name)

        for (const index in this.form.model.actions) {
          if (this.form.model.actions.hasOwnProperty(index)) {
            if (JSON.stringify(this.form.model.actions[index]) === JSON.stringify(data)) {
              // Same action added, nothing to do
              return
            } else if (this.form.model.actions[index].thing === data.thing) {
              // Action thing is updated
              this.form.model.actions[index] = data

              return
            }
          }
        }

        this.form.model.actions.push(data)
      },

      /**
       * Open edit routine action window
       *
       * @param {Number} index
       */
      editAction(index) {
        if (this.form.model.actions.hasOwnProperty(index)) {
          this.view.items.actionThingEdit.thing = this.$store.getters['entities/thing/query']()
            .with('device')
            .with('channel')
            .with('channel.properties')
            .where('id', this.form.model.actions[index].thing)
            .first()

          if (this.form.model.actions.hasOwnProperty(index)) {
            this.view.items.actionThingEdit.item = this.form.model.actions[index]
          }

          this.openView(this.view.items.actionThingEdit.name)
        }
      },

      /**
       * Change action state
       *
       * @param {Number} index
       */
      toggleActionState(index) {
        if (this.form.model.actions.hasOwnProperty(index)) {
          this.form.model.actions[index].enabled = !this.form.model.actions[index].enabled
        }
      },

      /**
       * Remove action settings from collection
       *
       * @param {Thing} thing
       */
      removeAction(thing) {
        for (const index in this.form.model.actions) {
          if (
            this.form.model.actions.hasOwnProperty(index) &&
            this.form.model.actions[index].thing === thing.id
          ) {
            this.form.model.actions.splice(index, 1)
          }
        }

        if (this.view.opened === this.view.items.actionThingEdit.name) {
          this.closeView(this.view.items.actionThingEdit.name)
        } else {
          this.openView(this.view.items.action.name)
        }
      },

      /**
       * NOTIFICATIONS
       */

      /**
       * Add notification settings to collection
       *
       * @param {Object} data
       */
      addNotification(data) {
        for (const notification of this.form.model.notifications) {
          if (JSON.stringify(notification) === JSON.stringify(data)) {
            this.$flashMessage(this.$t('routines.messages.sameNotificationAdded'), 'error')

            return
          }
        }

        this.form.model.notifications.push(data)

        this.closeView('notification')
      },

      /**
       * Change notification state
       *
       * @param {Number} index
       */
      toggleNotificationState(index) {
        if (this.form.model.notifications.hasOwnProperty(index)) {
          this.form.model.notifications[index].enabled = !this.form.model.notifications[index].enabled
        }
      },

      /**
       * Remove notification settings from collection
       *
       * @param {Number} index
       */
      removeNotification(index) {
        if (
          this.form.model.notifications.hasOwnProperty(index)
        ) {
          this.form.model.notifications.splice(index, 1)
        }
      },

      /**
       * ROUTINE GLOBAL
       */

      submit() {
        this.$validator.validateAll(this.form.scope)
          .then(result => {
            if (result) {
              if (this.form.model.conditions.length <= 0) {
                this.$flashMessage(this.$t('routines.messages.missingCondition'), 'error')

                return
              }

              if (this.form.model.actions.length <= 0 && this.form.model.notifications.length <= 0) {
                this.$flashMessage(this.$t('routines.messages.missingActionOrNotification'), 'error')

                return
              }

              this.$bus.$emit('wait-page_reloading', true)

              const errorMessage = this.$t('routines.messages.notCreated', {
                routine: this.form.model.name,
              })

              const mappedConditions = []

              this.form.model.conditions.forEach(condition => {
                condition.rows.forEach(row => {
                  mappedConditions.push({
                    type: 'channel_property',
                    enabled: condition.enabled,
                    channel: condition.thing,
                    property: row.property,
                    operator: row.operator,
                    operands: [row.operand],
                  })
                })
              })

              const mappedActions = []

              this.form.model.actions.forEach(action => {
                action.rows.forEach(row => {
                  mappedActions.push({
                    type: 'channel_property',
                    enabled: action.enabled,
                    channel: action.thing,
                    property: row.property,
                    value: row.operation,
                  })
                })
              })

              this.$store.dispatch('entities/trigger/add', {
                automatic: true,
                data: {
                  name: this.form.model.name,
                  comment: this.form.model.comment,
                  conditions: mappedConditions,
                  actions: mappedActions,
                  notifications: [],
                },
              }, {
                root: true,
              })
                .then(routine => {
                  this.$bus.$emit('wait-page_reloading', false)

                  this.$router.push(this.localePath({
                    name: this.$routes.routines.detail,
                    params: {
                      id: routine.id,
                    },
                  }))
                })
                .catch(e => {
                  this.$bus.$emit('wait-page_reloading', false)

                  if (e.hasOwnProperty('exception')) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            }
          })
          .catch(() => {
            // Nothing to do here
          })
      },

      /**
       * Close create action and navigate to list
       */
      closeCreate() {
        this.$router.push(this.localePath(this.$routes.routines.list))
      },

      /**
       * Open routines view
       *
       * @param {String} view
       * @param {Object} [item]
       */
      openView(view, item) {
        if (this.view.items.hasOwnProperty(view)) {
          this.view.opened = view

          if (this.view.items[view].hasOwnProperty('item') && typeof item !== 'undefined') {
            this.view.items[view].item = item
          }

          if (view === this.view.items.action.name) {
            this.view.items[view].items = this.actions
          } else if (view === this.view.items.condition.name) {
            this.view.items[view].items = this.conditions
          }
        }
      },

      /**
       * Close routines view window
       *
       * @param {String} view
       */
      closeView(view) {
        if (this.view.items.hasOwnProperty(view)) {
          this.view.opened = null

          if (this.view.items[view].hasOwnProperty('item')) {
            this.view.items[view].item = null
          }
        }

        this.errors.clear(this.form.scope)

        this._configureNavigation()
      },

      _sortItemsThings(items) {
        return items.sort((a, b) => {
          const aThing = this.$store.getters['entities/thing/find'](a.thing)
          const bThing = this.$store.getters['entities/thing/find'](b.thing)

          if (aThing.label > bThing.label) {
            return -1
          } else if (bThing.label > aThing.label) {
            return 1
          }

          return 0
        })
      },

      /**
       * Configure page header for small devices
       *
       * @private
       */
      _configureNavigation() {
        this.$store.dispatch('header/resetStore', null, {
          root: true,
        })

        this.$store.dispatch('header/setLeftButton', {
          name: this.$t('application.buttons.back.title'),
          link: this.localePath(this.$routes.routines.list),
          icon: 'arrow-left',
        }, {
          root: true,
        })

        this.$store.dispatch('header/hideRightButton', null, {
          root: true,
        })

        this.$store.dispatch('header/setFullRowHeading', null, {
          root: true,
        })

        this.$store.dispatch('header/setHeading', {
          heading: this.$t('application.headings.routines.add'),
        }, {
          root: true,
        })

        this.$store.dispatch('header/setHeadingIcon', {
          icon: 'project-diagram',
        }, {
          root: true,
        })

        this.$store.dispatch('bottomNavigation/resetStore', null, {
          root: true,
        })

        this.$store.dispatch('bottomNavigation/hideNavigation', null, {
          root: true,
        })
      },

    },

    head() {
      return {
        title: this.$t('meta.routines.create.title'),
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>
