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

    typeThing: {
      type: Boolean,
      default: false,
    },

    typeSensor: {
      type: Boolean,
      default: false,
    },

    remoteSubmit: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      model: {},
      groupedProperties: {
        actors: {
          analog: [],
          binary: [],
          lights: [],
          switches: [],
        },
        sensors: {
          analog: [],
          binary: [],
          energy: [],
          environment: [],
          events: [],
        },
      },
    }
  },

  watch: {

    remoteSubmit(val) {
      if (val) {
        this._collectData()
      }
    },

  },

  created() {
    this._initModel()

    this.groupedProperties.sensors.analog = this.typeSensor ? this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogSensor') : []
    this.groupedProperties.actors.analog = this.typeThing ? this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogActor') : []
    this.groupedProperties.sensors.binary = this.typeSensor ? this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinarySensor') : []
    this.groupedProperties.actors.analog = this.typeThing ? this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinaryActor') : []
    this.groupedProperties.actors.lights = this.typeThing ? this._.filter(this._.get(this.thing, 'channel.properties', []), 'isLight') : []
    this.groupedProperties.sensors.energy = this.typeSensor ? this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnergy') : []
    this.groupedProperties.sensors.environment = this.typeSensor ? this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnvironment') : []
    this.groupedProperties.actors.switches = this.typeThing ? this._.filter(this._.get(this.thing, 'channel.properties', []), 'isSwitch') : []
    this.groupedProperties.sensors.events = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEvent')
  },

  mounted() {
    this.$emit('loaded')
  },

  methods: {

    /**
     * Submit values
     */
    _collectData() {
      this.$emit('update:remoteSubmit', false)

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
