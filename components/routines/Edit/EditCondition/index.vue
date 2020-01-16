<template>
  <div class="fb-routines-edit-condition-thing__container">
    <template v-for="(groupProperties, group) in groupedProperties.actors">
      <list-items-container
        v-if="groupProperties.length"
        :key="group"
        :heading="$t(`routines.groups.actors.${group}`)"
      >
        <property
          v-for="property in groupProperties"
          :key="property.id"
          v-model="model"
          :thing="thing"
          :property="property"
        />
      </list-items-container>
    </template>

    <template v-for="(groupProperties, group) in groupedProperties.sensors">
      <list-items-container
        v-if="groupProperties.length"
        :key="group"
        :heading="$t(`routines.groups.sensors.${group}`)"
      >
        <property
          v-for="property in groupProperties"
          :key="property.id"
          v-model="model"
          :thing="thing"
          :property="property"
        />
      </list-items-container>
    </template>

    <fb-button
      v-if="condition !== null"
      variant="primary"
      size="lg"
      block
      mobile
      @click="edit"
    >
      {{ $t('routines.buttons.updateThing.title') }}
      <font-awesome-icon icon="sync-alt" />
    </fb-button>

    <fb-button
      v-else
      variant="primary"
      size="lg"
      block
      mobile
      @click="add"
    >
      {{ $t('routines.buttons.addThing.title') }}
      <font-awesome-icon icon="plus" />
    </fb-button>
  </div>
</template>

<script>
import Property from './Property'

export default {

  name: 'RoutinesEditEditCondition',

  components: {
    Property,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

    condition: {
      type: Object,
      default: null,
      validator: (value) => {
        return !(
          !Object.prototype.hasOwnProperty.call(value, 'thing') ||
          !Object.prototype.hasOwnProperty.call(value, 'enabled') ||
          !Object.prototype.hasOwnProperty.call(value, 'rows') ||
          !Array.isArray(value.rows) ||
          !value.rows.length
        )
      },
    },

  },

  data() {
    return {
      model: {},
    }
  },

  computed: {

    groupedProperties() {
      return {
        actors: {
          analog: this.analogActorsProperties,
          binary: this.binaryActorsProperties,
          lights: this.lightProperties,
          switches: this.switchProperties,
        },
        sensors: {
          analog: this.analogSensorsProperties,
          binary: this.binarySensorsProperties,
          energy: this.energyProperties,
          environment: this.environmentProperties,
          events: this.eventProperties,
          buttons: this.buttonProperties,
        },
      }
    },

    /**
     * Get all analog sensors properties
     *
     * @returns {Array}
     */
    analogSensorsProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogSensor')
    },

    /**
     * Get all analog actors properties
     *
     * @returns {Array}
     */
    analogActorsProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogActor')
    },

    /**
     * Get all binary sensors properties
     *
     * @returns {Array}
     */
    binarySensorsProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinarySensor')
    },

    /**
     * Get all binary actors properties
     *
     * @returns {Array}
     */
    binaryActorsProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinaryActor')
    },

    /**
     * Get all light properties
     *
     * @returns {Array}
     */
    lightProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isLight')
    },

    /**
     * Get all energy meter properties
     *
     * @returns {Array}
     */
    energyProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnergy')
    },

    /**
     * Get all energy meter properties
     *
     * @returns {Array}
     */
    environmentProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnvironment')
    },

    /**
     * Get all relay switch properties
     *
     * @returns {Array}
     */
    switchProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isSwitch')
    },

    /**
     * Get all event properties
     *
     * @returns {Array}
     */
    eventProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEvent')
    },

    /**
     * Get all button properties
     *
     * @returns {Array}
     */
    buttonProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isButton')
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
      }, {
        root: true,
      })
    } else {
      this.$store.dispatch('header/setRightButton', {
        name: this.$t('application.buttons.close.title'),
        callback: () => {
          this._initModel()

          this.$emit('close')
        },
      }, {
        root: true,
      })
    }

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
        rows: this._.filter(this._.get(this.model, 'rows', []), 'selected')
          .map((row) => {
            return {
              property_id: row.property_id,
              operator: row.operator,
              operand: row.operand,
            }
          }),
      }

      const missingOperand = this._.filter(condition.rows, ({ operand }) => operand === null)

      missingOperand
        .forEach((row) => {
          this.$flashMessage(this.$t('routines.messages.fillConditionOperand', {
            thing: this.$tThing(this.thing),
            property: this.$tChannelProperty(this.thing, this.$store.getters['entities/channel_property/find'](row.property)),
          }), 'info')
        })

      if (condition.rows.length && missingOperand.length === 0) {
        this.$emit('add', condition)
      } else if (missingOperand.length === 0) {
        this.$flashMessage(this.$t('routines.messages.selectPropertyCondition'), 'info')
      }
    },

    /**
     * Initialize model object
     *
     * @private
     */
    _initModel() {
      this.model = {
        thing: this.thing.id,
        rows: [],
      }

      // Iterate over all thing[device channel] properties
      this._.get(this.thing, 'channel.properties', [])
        .forEach((property) => {
          let defaultOperand = null

          if (property.isBoolean) {
            defaultOperand = true
          } else if (property.isEnum) {
            defaultOperand = this._getPropertyDefaultValue(property)
          }

          if (this.condition) {
            const storedProperty = this.condition.rows.find(row => row.property_id === property.id)

            if (typeof storedProperty !== 'undefined') {
              this.model.rows.push({
                property_id: property.id,
                selected: true,
                operator: storedProperty.operator,
                operand: storedProperty.operand,
              })
            } else {
              this.model.rows.push({
                property_id: property.id,
                selected: false,
                operator: 'eq',
                operand: defaultOperand,
              })
            }
          } else {
            this.model.rows.push({
              property_id: property.id,
              selected: false,
              operator: 'eq',
              operand: defaultOperand,
            })
          }
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
