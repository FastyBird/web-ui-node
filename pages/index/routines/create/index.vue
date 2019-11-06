<template>
  <div class="fb-routines-create-view__container">
    <form
      v-show="view.opened.type === null"
      class="p-x-sm p-t-sm"
      @submit.prevent="submit"
    >
      <fb-form-input
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

      <fb-form-text-area
        v-model="form.model.comment"
        :data-vv-scope="form.scope"
        :error="errors.first(form.scope + '.comment')"
        :has-error="errors.has(form.scope + '.comment')"
        :name="'comment'"
        :label="$t('field.comment.title')"
        :tab-index="2"
      />

      <h3 class="fb-routines-create-view__heading">
        Add a thing condition to this routine?
      </h3>

      <fb-button
        variant="outline-default"
        block
        class="text-left"
        @click="openView(view.condition.name)"
      >
        <font-awesome-icon
          icon="plus-circle"
          class="icon-2x m-r-md pull-left"
        />
        <span class="pull-left">{{ $t('buttons.addThing.title') }}</span>
      </fb-button>

      <div
        v-if="view.opened.type === null"
        class="p-t-sm"
      >
        <routines-edit-list-condition
          v-for="(condition, index) in conditions"
          :key="`c-${index}`"
          :condition="condition"
          class="fb-routines-create-view__conditions-container"
          @edit="editCondition(index)"
          @toggle="toggleConditionState(index)"
        />
      </div>

      <hr>

      <h3 class="fb-routines-create-view__heading">
        Add a thing action to this routine?
      </h3>

      <fb-button
        variant="outline-default"
        block
        class="text-left"
        @click="openView(view.action.name)"
      >
        <font-awesome-icon
          icon="plus-circle"
          class="icon-2x m-r-md pull-left"
        />
        <span class="pull-left">{{ $t('buttons.addThing.title') }}</span>
      </fb-button>

      <div
        v-if="view.opened.type === null"
        class="p-t-sm"
      >
        <routines-edit-list-action
          v-for="(action, index) in actions"
          :key="`a-${index}`"
          :action="action"
          class="fb-routines-create-view__actions-container"
          @edit="editAction(index)"
          @toggle="toggleActionState(index)"
        />
      </div>

      <fb-button
        variant="primary"
        size="lg"
        block
        mobile
        class="text-right"
        @click="submit"
      >
        {{ $t('buttons.save.title') }}
        <font-awesome-icon icon="plus" />
      </fb-button>
    </form>

    <routines-edit-select-thing
      v-if="view.opened.type === view.action.name || view.opened.type === view.condition.name"
      :items="view[view.opened.type].items"
      :only-settable="view.opened.type === view.action.name"
      @select="thingSelected"
      @close="closeView(view.opened.type)"
    />

    <routines-edit-edit-condition
      v-if="view.opened.type === view.conditionThing.name"
      :thing="view.conditionThing.thing"
      :conditions="conditions"
      @add="addCondition"
      @back="openView(view.condition.name)"
      @close="closeView(view.conditionThing.name)"
      @remove="removeCondition"
    />

    <routines-edit-edit-condition
      v-if="view.opened.type === view.conditionThingEdit.name"
      :thing="view.conditionThingEdit.thing"
      :conditions="conditions"
      @add="addCondition"
      @back="closeView(view.conditionThingEdit.name)"
      @close="closeView(view.conditionThingEdit.name)"
      @remove="removeCondition"
    />

    <routines-edit-edit-action
      v-if="view.opened.type === view.actionThing.name"
      :thing="view.actionThing.thing"
      :actions="actions"
      @add="addAction"
      @back="openView(view.action.name)"
      @close="closeView(view.actionThing.name)"
      @remove="removeAction"
    />

    <routines-edit-edit-action
      v-if="view.opened.type === view.actionThingEdit.name"
      :thing="view.actionThingEdit.thing"
      :actions="actions"
      @add="addAction"
      @back="closeView(view.actionThingEdit.name)"
      @close="closeView(view.actionThingEdit.name)"
      @remove="removeAction"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import {
    ROUTINES_LIST_LINK,
    ROUTINES_ROUTINE_DETAIL_LINK,

    ROUTINES_HASH_CREATE,
  } from '@/configuration/routes'

  const RoutinesEditSelectThing = () => import('@/components/routines/Edit/SelectThing')

  const RoutinesEditListCondition = () => import('@/components/routines/Edit/ListCondition')
  const RoutinesEditEditCondition = () => import('@/components/routines/Edit/EditCondition')
  const RoutinesEditListAction = () => import('@/components/routines/Edit/ListAction')
  const RoutinesEditEditAction = () => import('@/components/routines/Edit/EditAction')

  export default {

    name: 'RoutineCreatePage',

    components: {
      RoutinesEditSelectThing,

      RoutinesEditListCondition,
      RoutinesEditEditCondition,
      RoutinesEditListAction,
      RoutinesEditEditAction,
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
          opened: {
            type: null,
          },
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
          },
          notification: {
            name: 'notification',
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
        link: app.localePath({ name: ROUTINES_LIST_LINK }),
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
        this.$router.push(`${this.localePath({ name: ROUTINES_LIST_LINK })}${ROUTINES_HASH_CREATE}`)

        return
      }

      this._configureNavigation()

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

      /**
       * Condition or action thing is selected, opening properties select
       *
       * @param {Thing} thing
       */
      thingSelected(thing) {
        if (this.view.opened.type === this.view.action.name) {
          this.view.actionThing.thing = thing
          this.view.actionThing.items = this.actions

          this.openView(this.view.actionThing.name)
        } else if (this.view.opened.type === this.view.condition.name) {
          this.view.conditionThing.thing = thing
          this.view.conditionThing.items = this.conditions

          this.openView(this.view.conditionThing.name)
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
        this.closeView(this.view.conditionThing.name)

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
          this.view.conditionThingEdit.thing = this.$store.getters['entities/thing/find'](this.form.model.conditions[index].thing)

          this.openView(this.view.conditionThingEdit.name)
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

        if (this.view.opened === this.view.conditionThingEdit.name) {
          this.closeView(this.view.conditionThingEdit.name)
        } else {
          this.openView(this.view.condition.name)
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
        this.closeView(this.view.actionThing.name)

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
          this.view.actionThingEdit.thing = this.$store.getters['entities/thing/find'](this.form.model.actions[index].thing)

          this.openView(this.view.actionThingEdit.name)
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

        if (this.view.opened === this.view.actionThingEdit.name) {
          this.closeView(this.view.actionThingEdit.name)
        } else {
          this.openView(this.view.action.name)
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
                this.$flashMessage(this.$t('messages.missingCondition'), 'error')

                return
              }

              if (this.form.model.actions.length <= 0 && this.form.model.notifications.length <= 0) {
                this.$flashMessage(this.$t('messages.missingActionOrNotification'), 'error')

                return
              }

              const errorMessage = this.$t('messages.notCreated', {
                routine: this.form.model.name,
              })

              const mappedConditions = []

              this.form.model.conditions.forEach(condition => {
                condition.rows.forEach(row => {
                  mappedConditions.push({
                    type: 'channel_property',
                    enabled: condition.enabled,
                    thing: condition.channel,
                    channel: row.channel,
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
                    thing: action.channel,
                    channel: row.channel,
                    property: row.property,
                    value: row.operation,
                  })
                })
              })

              this.$store.dispatch('entities/trigger/add', {
                automatic: true,
                direct: false,
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
                  this.$flashMessage(this.$t('messages.created', {
                    routine: this.form.model.name,
                  }))

                  this.$router.push(this.localePath({ name: ROUTINES_ROUTINE_DETAIL_LINK, params: { id: routine.id } }))
                })
                .catch(e => {
                  console.log(e)
                  if (e.hasOwnProperty('exception')) {
                    this.handleFormError(e.exception, errorMessage)
                  } else {
                    this.$flashMessage(errorMessage, 'error')
                  }
                })
            } else {
              this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
            }
          })
          .catch((e) => {
            console.log(e)
            this.$flashMessage(this.$t('application.messages.fixAllFormErrors'), 'info')
          })
      },

      /**
       * Close create action and navigate to list
       */
      closeCreate() {
        this.$router.push(this.localePath({ name: ROUTINES_LIST_LINK }))
      },

      /**
       * Add notification settings to collection
       *
       * @param {Object} data
       */
      addNotification(data) {
        for (const notification of this.form.model.notifications) {
          if (JSON.stringify(notification) === JSON.stringify(data)) {
            this.$flashMessage(this.$t('messages.sameNotificationAdded'), 'error')

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
       * Open routines view
       *
       * @param {String} view
       * @param {Object} [item]
       */
      openView(view, item) {
        if (this.view.hasOwnProperty(view)) {
          this.view.opened.type = view

          if (this.view[view].hasOwnProperty('item') && typeof item !== 'undefined') {
            this.view[view].item = item
          }

          if (view === this.view.action.name) {
            this.view[view].items = this.actions
          } else if (view === this.view.condition.name) {
            this.view[view].items = this.conditions
          }
        }
      },

      /**
       * Close routines view window
       *
       * @param {String} view
       */
      closeView(view) {
        if (this.view.hasOwnProperty(view)) {
          this.view.opened.type = null

          if (this.view[view].hasOwnProperty('item')) {
            this.view[view].item = null
          }
        }

        this.$store.dispatch('header/setLeftButton', {
          name: this.$t('application.buttons.back.title'),
          link: this.localePath({ name: ROUTINES_LIST_LINK }),
          icon: 'arrow-left',
        }, {
          root: true,
        })

        this.$store.dispatch('header/resetRightButton', null, {
          root: true,
        })

        this.$store.dispatch('header/hideRightButton', null, {
          root: true,
        })

        this.errors.clear(this.form.scope)
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
          link: this.localePath({ name: ROUTINES_LIST_LINK }),
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

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import 'index';
</style>

<i18n src="./locales.json" />
