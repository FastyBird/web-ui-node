<template>
  <div class="fb-iot-things-detail-button__container">
    <fb-loading-box
      v-if="fetchingTriggers || !triggersLoaded"
      :text="$t('things.texts.loadingTriggers')"
    />

    <template v-else-if="view.opened === null">
      <no-results
        v-if="actions.length === 0"
        :message="$t('things.texts.noThingsActions')"
        icon="cube"
        second-icon="plug"
      />

      <list-items-container
        v-else
        :heading="$t('triggers.headings.actions')"
      >
        <trigger-action
          v-for="(action, index) in actions"
          :key="`a-${index}`"
          :action="action"
          class="fb-iot-things-detail-button__actions-container"
          @toggle="toggleActionState(index)"
        />
      </list-items-container>
    </template>

    <select-thing
      v-if="view.opened === view.items.action.name"
      :items="view.items[view.opened].items"
      :only-settable="true"
      @select="thingSelected"
      @close="closeView(view.opened)"
    />

    <div class="fb-iot-things-detail-button__action-container">
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
  </div>
</template>

<script>
  import {
    THINGS_HASH_SETTINGS,
  } from '@/configuration/routes'

  const TriggerAction = () => import('./Action')

  const SelectThing = () => import('@/components/routines/Edit/SelectThing')
  const EditAction = () => import('@/components/routines/Edit/EditAction')

  export default {

    name: 'ThingsDetailButton',

    components: {
      TriggerAction,

      SelectThing,
      EditAction,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

    },

    data() {
      return {
        view: {
          opened: null,
          items: {
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
          },
        },
      }
    },

    computed: {

      property() {
        return this.thing.channel.properties[0]
      },

      /**
       * Thing direct trigger
       *
       * @returns {Trigger}
       */
      trigger() {
        return this.$store.getters['entities/trigger/query']()
          .with('condition')
          .with('actions')
          .where('channel_id', this.thing.channel_id)
          .where('property_id', this.property.id)
          .first()
      },

      /**
       * Remap trigger actions for displaying
       *
       * @returns {Array}
       */
      actions() {
        const actions = []

        this._.get(this.trigger, 'actions', [])
          .forEach(action => {
            if (typeof actions.find(({ channel_id }) => channel_id === action.channel_id) === 'undefined') {
              actions.push({
                thing: action.channel_id,
                enabled: action.enabled,
                device_id: action.device_id,
                channel_id: action.channel_id,
                rows: [],
              })
            }
          })

        for (const i in actions) {
          if (actions.hasOwnProperty(i)) {
            this._.filter(this._.get(this.trigger, 'actions', []), { 'channel_id': actions[i].channel_id })
              .forEach(action => {
                actions[i].rows.push({
                  id: action.id,
                  property_id: action.property_id,
                  operation: action.value,
                })
              })
          }
        }

        return actions
      },

      /**
       * Flag signalizing that things are loading from server
       *
       * @returns {Boolean}
       */
      fetchingThings() {
        return this.$store.getters['entities/thing/fetching']()
      },

      /**
       * Flag signalizing that things are loaded from server
       *
       * @returns {Boolean}
       */
      thingsLoaded() {
        return this.$store.getters['entities/thing/firstLoadFinished']()
      },

      /**
       * Flag signalizing that triggers are loading from server
       *
       * @returns {Boolean}
       */
      fetchingTriggers() {
        return this.$store.getters['entities/trigger/fetching']()
      },

      /**
       * Flag signalizing that triggers are loaded from server
       *
       * @returns {Boolean}
       */
      triggersLoaded() {
        return this.$store.getters['entities/trigger/firstLoadFinished']()
      },

    },

    watch: {

      '$route'(val) {
        if (this._.get(val, 'hash', '') === '') {
          this._configureNavigation()
        }
      },

    },

    beforeMount() {
      if (
        this.$store.getters['entities/trigger/query']().count() === 0 &&
        !this.fetchingTriggers &&
        !this.triggersLoaded
      ) {
        this.$store.dispatch('entities/trigger/fetch', null, {
          root: true,
        })
          .catch(() => {
            this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      }

      if (
        !this.fetchingThings &&
        !this.thingsLoaded
      ) {
        this.$store.dispatch('entities/thing/fetch', null, {
          root: true,
        })
          .catch(() => {
            this.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
          })
      }
    },

    beforeUpdate() {
      this._configureNavigation()
    },

    methods: {

      /**
       * Action thing is selected, opening properties select
       *
       * @param {Thing} thing
       */
      thingSelected(thing) {
        if (this.view.opened === this.view.items.action.name) {
          this.view.items.actionThing.thing = thing

          this.openView(this.view.items.actionThing.name)
        }
      },

      /**
       * Add action settings to collection
       *
       * @param {Object} data
       */
      addAction(data) {
        this.closeView(this.view.items.actionThing.name)

        const errorMessage = this.$t('things.messages.triggerNotCreated')

        this.$bus.$emit('wait-page_reloading', true)

        if (!this.trigger) {
          const mappedActions = []

          data.rows.forEach(row => {
            mappedActions.push({
              type: 'channel_property',
              enabled: data.enabled,
              channel: data.thing,
              property: row.property,
              value: row.operation,
            })
          })

          this.$store.dispatch('entities/trigger/add', {
            channelProperty: true,
            data: {
              name: this.thing.device_id,
              comment: this.thing.channel_id,
              channel: this.thing.channel_id,
              property: this.thing.channel.properties[0].id,
              operator: 'eq',
              operand: '1',
              actions: mappedActions,
            },
          }, {
            root: true,
          })
            .then(() => {
              this.$bus.$emit('wait-page_reloading', false)
            })
            .catch(e => {
              this.$bus.$emit('wait-page_reloading', false)

              if (e.hasOwnProperty('exception')) {
                this.handleFormError(e.exception, errorMessage)
              } else {
                this.$flashMessage(errorMessage, 'error')
              }
            })
        } else {
          data.rows.forEach(row => {
            this.$store.dispatch('entities/action/add', {
              trigger: this.trigger,
              data: {
                type: 'channel_property',
                enabled: data.enabled,
                channel: data.thing,
                property: row.property,
                value: row.operation,
              },
            }, {
              root: true,
            })
              .then(() => {
                this.$bus.$emit('wait-page_reloading', false)
              })
              .catch(e => {
                this.$bus.$emit('wait-page_reloading', false)

                if (e.hasOwnProperty('exception')) {
                  this.handleFormError(e.exception, errorMessage)
                } else {
                  this.$flashMessage(errorMessage, 'error')
                }
              })
          })
        }
      },

      removeAction(thing) {
        console.log(thing)
      },

      /**
       * Open triggers view
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
          }
        }
      },

      /**
       * Close triggers view window
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

        this._configureNavigation()
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
          link: this.localePath(this.$routes.things.list),
          icon: 'arrow-left',
        }, {
          root: true,
        })

        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.edit.title'),
          callback: () => {
            this.$router.push(this.localePath({
              name: this.$routes.things.detail,
              params: {
                id: this.thing.id,
              },
              hash: THINGS_HASH_SETTINGS,
            }))
          },
        }, {
          root: true,
        })

        this.$store.dispatch('header/setFullRowHeading', null, {
          root: true,
        })

        this.$store.dispatch('header/setHeading', {
          heading: this.$tThing(this.thing),
          subHeading: this.$tThingDevice(this.thing),
        }, {
          root: true,
        })

        this.$store.dispatch('header/setHeadingIcon', {
          icon: this.$thingIcon(this.thing),
        }, {
          root: true,
        })

        this.$store.dispatch('header/setAddButton', {
          name: this.$t('application.buttons.add.title'),
          callback: () => {
            this.openView(this.view.items.action.name)
          },
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

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
