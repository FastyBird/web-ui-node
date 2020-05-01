<template>
  <div class="fb-routines-edit-condition-thing__container">
    <list-items-container
      v-if="actors.length"
      :heading="$t('routines.groups.actors')"
    >
      <property
        v-for="property in actors"
        :key="property.id"
        v-model="model"
        :thing="thing"
        :property="property"
      />
    </list-items-container>

    <list-items-container
      v-if="sensors.length"
      :heading="$t('routines.groups.sensors')"
    >
      <property
        v-for="property in sensors"
        :key="property.id"
        v-model="model"
        :thing="thing"
        :property="property"
      />
    </list-items-container>
  </div>
</template>

<script>
import Property from './Property'

import ChannelProperty from '~/models/devices-node/ChannelProperty'

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
      actors: [],
      sensors: [],
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
    this.actors = ChannelProperty
      .query()
      .where('channel_id', this.thing.channel_id)
      .where('isSettable', true)
      .get()

    this.sensors = ChannelProperty
      .query()
      .where('channel_id', this.thing.channel_id)
      .where('isSettable', false)
      .get()

    this._initModel()
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
        device: this.action ? this.action.device : this.thing.device.identifier,
        channel: this.action ? this.action.channel : this.thing.channel.channel,
        enabled: this.action ? this.action.enabled : true,
        rows: this._.filter(this.model.rows, 'selected')
          .map((row) => {
            return {
              property: row.property,
              operator: row.operator,
              operand: row.operand,
            }
          }),
      }

      const missingOperand = this._.filter(condition.rows, ({ operand }) => operand === null)

      missingOperand
        .forEach((row) => {
          this.$flashMessage(this.$t('routines.messages.fillConditionOperand', {
            thing: this.$tThingChannel(this.thing),
            property: this.$tChannelProperty(this.thing, ChannelProperty.query().where('property', row.property).first()),
          }), 'info')
        })

      if (condition.rows.length && missingOperand.length === 0) {
        this.$emit('add', condition, this.condition)
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
      this.actors.concat(this.sensors)
        .forEach((property) => {
          let defaultOperand = null

          if (property.isBoolean) {
            defaultOperand = true
          } else if (property.isEnum) {
            defaultOperand = this._getPropertyDefaultValue(property)
          }

          if (this.condition) {
            const storedProperty = this.condition.rows.find(row => row.property === property.property)

            if (typeof storedProperty !== 'undefined') {
              this.model.rows.push({
                property: property.property,
                selected: true,
                operator: storedProperty.operator,
                operand: storedProperty.operand,
              })
            } else {
              this.model.rows.push({
                property: property.property,
                selected: false,
                operator: 'eq',
                operand: defaultOperand,
              })
            }
          } else {
            this.model.rows.push({
              property: property.property,
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
