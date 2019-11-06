<template>
  <div class="fb-routines-edit-condition-thing__container p-t-sm p-b-md m-b-lg">
    <template v-for="(groupChannels, group) in groupedChannels.actors">
      <div
        v-if="groupChannels.length"
        :key="group"
      >
        <h3 class="fb-routines-edit-condition-thing__heading">
          {{ $t(`groups.actors.${group}`) }}
        </h3>

        <channels-properties
          v-model="model.configuration"
          :thing="thing"
          :channels="groupChannels"
          :condition="condition"
        />
      </div>
    </template>

    <template v-for="(groupChannels, group) in groupedChannels.sensors">
      <div
        v-if="groupChannels.length"
        :key="group"
      >
        <h3 class="fb-routines-edit-condition-thing__heading">
          {{ $t(`groups.sensors.${group}`) }}
        </h3>

        <channels-properties
          v-model="model.configuration"
          :thing="thing"
          :channels="groupChannels"
          :condition="condition"
        />
      </div>
    </template>

    <fb-button
      v-if="condition !== null"
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

    name: 'RoutinesEditEditCondition',

    components: {
      ChannelsProperties,
    },

    props: {

      thing: {
        type: Object,
        required: true,
      },

      conditions: {
        type: Array,
        default: () => {
          return []
        },
        validator: (value) => {
          value.forEach(condition => {
            if (
              !condition.hasOwnProperty('enabled') ||
              !condition.hasOwnProperty('thing') ||
              !condition.hasOwnProperty('properties') ||
              !Array.isArray(condition.properties) ||
              !condition.properties.length
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
          'actors': {
            'analog': this.analogActorsChannels,
            'binary': this.binaryActorsChannels,
            'lights': this.lightChannels,
            'switches': this.switchChannels,
          },
          'sensors': {
            'analog': this.analogSensorsChannels,
            'binary': this.binarySensorsChannels,
            'energy': this.energyChannels,
            'environment': this.environmentChannels,
            'events': this.eventChannels,
            'buttons': this.buttonChannels,
          },
        }
      },

      /**
       * Get all analog sensors channels
       *
       * @returns {Array}
       */
      analogSensorsChannels() {
        return this._.filter(this.channels, 'isAnalogSensor')
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
       * Get all binary sensors channels
       *
       * @returns {Array}
       */
      binarySensorsChannels() {
        return this._.filter(this.channels, 'isBinarySensor')
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
       * Get all energy meter channels
       *
       * @returns {Array}
       */
      energyChannels() {
        return this._.filter(this.channels, 'isEnergy')
      },

      /**
       * Get all energy meter channels
       *
       * @returns {Array}
       */
      environmentChannels() {
        return this._.filter(this.channels, 'isEnvironment')
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
       * Get all event channels
       *
       * @returns {Array}
       */
      eventChannels() {
        return this._.filter(this.channels, 'isEvent')
      },

      /**
       * Get all button channels
       *
       * @returns {Array}
       */
      buttonChannels() {
        return this._.filter(this.channels, 'isButton')
      },

      /**
       * Get assigned condition if exists
       *
       * @returns {Object|null}
       */
      condition() {
        const condition = this.conditions.find(item => {
          return item.thing === this.thing.id
        })

        return typeof condition !== 'undefined' ? condition : null
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

      if (this.condition !== null) {
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
        const condition = {
          thing: this.condition ? this.condition.thing : this.thing.id,
          enabled: this.condition ? this.condition.enabled : true,
          rows: [],
        }

        let missingOperand = false

        this.model.configuration.forEach(channel => {
          channel.properties.forEach(property => {
            if (property.selected && property.operand !== null) {
              condition.rows.push({
                channel: channel.channel,
                property: property.property,
                operator: property.operator,
                operand: property.operand,
              })
            } else if (property.selected && property.operand === null) {
              this.$toasted.info(this.$t('messages.fillOperand', {
                channel: this.$tChannel(this.thing, this.$store.getters['entities/channel/find'](channel.channel)),
                property: this.$tChannelProperty(this.thing, this.$store.getters['entities/channel/find'](channel.channel), this.$store.getters['entities/channel_property/find'](property.property)),
              }), {
                condition: {
                  text: this.$t('application.buttons.close.title'),
                  onClick: (evnt, toastObject) => {
                    toastObject.goAway(0)
                  },
                },
              })

              missingOperand = true
            }
          })
        })

        if (condition.rows.length && !missingOperand) {
          this.$emit('add', condition)
        } else if (!missingOperand) {
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

        const condition = this.conditions.find(item => {
          return item.thing === this.thing.id
        })

        this.channels.forEach(channel => {
          const operator = {
            channel: channel.id,
            properties: [],
          }

          channel.properties
            .forEach(property => {
              let defaultOperand = null

              if (property.isBoolean) {
                defaultOperand = true
              } else if (property.isEnum) {
                defaultOperand = this._getPropertyDefaultValue(property)
              }

              if (typeof condition !== 'undefined') {
                const storedProperty = condition.rows.find(item => {
                  return item.property === property.id
                })

                if (typeof storedProperty !== 'undefined') {
                  operator.properties.push({
                    property: property.id,
                    selected: true,
                    operator: storedProperty.operator,
                    operand: storedProperty.operand,
                  })
                } else {
                  operator.properties.push({
                    property: property.id,
                    selected: false,
                    operator: 'eq',
                    operand: defaultOperand,
                  })
                }
              } else {
                operator.properties.push({
                  property: property.id,
                  selected: false,
                  operator: 'eq',
                  operand: defaultOperand,
                })
              }
            })

          this.model.configuration.push(operator)
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
