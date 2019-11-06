<template>
  <div class="fb-routines-edit-action-thing__container p-t-sm">
    <template v-for="(groupChannels, group) in groupedChannels">
      <div
        v-if="groupChannels.length"
        :key="group"
      >
        <h3 class="fb-routines-edit-action-thing__heading">
          {{ $t(`groups.${group}`) }}
        </h3>

        <channels-properties
          v-model="model.configuration"
          :thing="thing"
          :channels="groupChannels"
          :action="action"
        />
      </div>
    </template>

    <fb-button
      v-if="action !== null"
      variant="primary"
      size="lg"
      block
      mobile
      class="text-right"
      @click="edit"
    >
      {{ $t('buttons.update.title') }}
      <font-awesome-icon icon="sync-alt" />
    </fb-button>

    <fb-button
      v-else
      variant="primary"
      size="lg"
      block
      mobile
      class="text-right"
      @click="add"
    >
      {{ $t('buttons.add.title') }}
      <font-awesome-icon icon="plus" />
    </fb-button>
  </div>
</template>

<script>
  import { orderBy } from 'natural-orderby'

  import ChannelsProperties from './Properties'

  export default {

    name: 'RoutinesEditEditAction',

    components: {
      ChannelsProperties,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      actions: {
        type: Array,
        default: () => {
          return []
        },
        validator: (value) => {
          value.forEach(action => {
            if (
              !action.hasOwnProperty('enabled') ||
              !action.hasOwnProperty('thing') ||
              !action.hasOwnProperty('rows') ||
              !Array.isArray(action.rows) ||
              !action.rows.length
            ) {
              return false
            }
          })

          return true
        },
      },

    },

    data() {
      return {
        model: {
          configuration: [],
        },
      }
    },

    computed: {

      /**
       * Find all thing channels with settable properties
       *
       * @returns {Array}
       */
      channels() {
        const items = []

        const channels = this.$store.getters['entities/channel/query']()
          .with('properties')
          .where('thing_id', this.thing.id)
          .whereHas('properties', (query) => {
            query.where('is_settable', true)
          })
          .orderBy('structure_type')
          .orderBy('name')
          .all()

        for (const channel of channels) {
          items.push(channel)
        }

        return orderBy(
          items,
          [v => v.name],
          ['asc'],
        )
      },

      groupedChannels() {
        return {
          'analog': this.analogActorsChannels,
          'binary': this.binaryActorsChannels,
          'lights': this.lightChannels,
          'switches': this.switchChannels,
        }
      },

      /**
       * Get all analog actors channels
       *
       * @returns {Array}
       */
      analogActorsChannels() {
        return this._.filter(this.channels, 'isAnalogActor')
      },

      /**
       * Get all binary actors channels
       *
       * @returns {Array}
       */
      binaryActorsChannels() {
        return this._.filter(this.channels, 'isBinaryActor')
      },

      /**
       * Get all light channels
       *
       * @returns {Array}
       */
      lightChannels() {
        return this._.filter(this.channels, 'isLight')
      },

      /**
       * Get all relay switch channels
       *
       * @returns {Array}
       */
      switchChannels() {
        return this._.filter(this.channels, 'isSwitch')
      },

      /**
       * Get assigned action if exists
       *
       * @returns {Object|null}
       */
      action() {
        const action = this.actions.find(item => {
          return item.thing === this.thing.id
        })

        return typeof action !== 'undefined' ? action : null
      },

    },

    watch: {

      channels() {
        this._initModel()
      },

    },

    created() {
      this._initModel()

      this.$store.dispatch('header/resetStore', null, {
        root: true,
      })

      this.$store.dispatch('header/setLeftButton', {
        name: this.$t('application.buttons.back.title'),
        callback: () => {
          this._initModel()

          this.$emit('back')
        },
        icon: 'arrow-left',
      }, {
        root: true,
      })

      if (this.action !== null) {
        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.remove.title'),
          callback: () => {
            this._initModel()

            this.$emit('remove', this.thing)
          },
          icon: 'trash-alt',
        }, {
          root: true,
        })
      } else {
        this.$store.dispatch('header/setRightButton', {
          name: this.$t('application.buttons.back.title'),
          callback: () => {
            this._initModel()

            this.$emit('close')
          },
          icon: 'times',
        }, {
          root: true,
        })
      }

      this.$store.dispatch('header/setFullRowHeading', null, {
        root: true,
      })

      this.$store.dispatch('header/setHeading', {
        heading: this.thing.label,
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

    mounted() {
      this.$emit('loaded')
    },

    methods: {

      /**
       * Add values
       *
       * @param {Object} event
       */
      add(event) {
        event && event.preventDefault()

        this._collectData()
      },

      /**
       * Update values
       *
       * @param {Object} event
       */
      edit(event) {
        event && event.preventDefault()

        this._collectData()
      },

      /**
       * Submit values
       */
      _collectData() {
        const action = {
          thing: this.action ? this.action.thing : this.thing.id,
          enabled: this.action ? this.action.enabled : true,
          rows: [],
        }

        this.model.configuration.forEach(channel => {
          channel.properties.forEach(property => {
            if (property.selected) {
              action.rows.push({
                channel: channel.channel,
                property: property.property,
                operation: property.operation,
              })
            }
          })
        })

        if (action.rows.length) {
          this.$emit('add', action)
        } else {
          this.$toasted.info(this.$t('messages.selectProperty'), {
            condition: {
              text: this.$t('application.buttons.close.title'),
              onClick: (evnt, toastObject) => {
                toastObject.goAway(0)
              },
            },
          })
        }
      },

      /**
       * Initialize model object
       *
       * @private
       */
      _initModel() {
        this.model = {
          configuration: [],
        }

        const action = this.actions.find(item => {
          return item.thing === this.thing.id
        })

        this.channels.forEach(channel => {
          const operation = {
            channel: channel.id,
            properties: [],
          }

          channel.properties
            .forEach(property => {
              let defaultValue = null

              if (property.isBoolean) {
                defaultValue = true
              } else if (property.isEnum) {
                defaultValue = this._getPropertyDefaultValue(property)
              }

              if (typeof action !== 'undefined') {
                const storedProperty = action.rows.find(item => {
                  return item.property === property.id
                })

                if (typeof storedProperty !== 'undefined') {
                  operation.properties.push({
                    property: property.id,
                    selected: true,
                    operation: storedProperty.operation,
                  })
                } else {
                  operation.properties.push({
                    property: property.id,
                    selected: false,
                    operation: defaultValue,
                  })
                }
              } else {
                operation.properties.push({
                  property: property.id,
                  selected: false,
                  operation: defaultValue,
                })
              }
            })

          this.model.configuration.push(operation)
        })
      },

      /**
       * Get default property value
       *
       * @param {ChannelProperty} property
       *
       * @return {(String|null)}
       *
       * @private
       */
      _getPropertyDefaultValue(property) {
        if (property !== null) {
          if (property.isNumber) {

          } else if (property.isBoolean) {

          } else if (property.isString) {

          } else if (property.isEnum) {
            const values = property.format.split(',')

            return this._.get(values, '[0]', '').trim()
          }
        }

        return null
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>

<i18n src="./locales.json" />
