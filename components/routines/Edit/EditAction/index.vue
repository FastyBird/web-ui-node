<template>
  <div class="fb-routines-edit-action-thing__container">
    <template v-for="(groupProperties, group) in groupedProperties">
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
  </div>
</template>

<script>
import Property from './Property'

export default {

  name: 'RoutinesEditEditAction',

  components: {
    Property,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

    action: {
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

    remoteSubmit: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      model: {},
      groupedProperties: {
        analog: [],
        binary: [],
        lights: [],
        switches: [],
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

    this.groupedProperties.analog = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isAnalogActor')
    this.groupedProperties.binary = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isBinaryActor')
    this.groupedProperties.lights = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isLight')
    this.groupedProperties.switches = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isSwitch')
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

      const action = {
        thing: this.action ? this.action.thing : this.thing.id,
        enabled: this.action ? this.action.enabled : true,
        rows: this._.filter(this._.get(this.model, 'rows', []), 'selected')
          .map((row) => {
            return {
              property_id: row.property_id,
              operation: row.operation,
            }
          }),
      }

      if (action.rows.length) {
        this.$emit('add', action)
      } else {
        this.$flashMessage(this.$t('routines.messages.selectPropertyAction'), 'info')
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
          let defaultValue = null

          if (property.isBoolean) {
            defaultValue = true
          } else if (property.isEnum) {
            defaultValue = this._getPropertyDefaultValue(property)
          }

          if (this.action) {
            const storedProperty = this.action.rows.find(row => row.property_id === property.id)

            if (typeof storedProperty !== 'undefined') {
              this.model.rows.push({
                property_id: property.id,
                selected: true,
                operation: storedProperty.operation,
              })
            } else {
              this.model.rows.push({
                property_id: property.id,
                selected: false,
                operation: defaultValue,
              })
            }
          } else {
            this.model.rows.push({
              property_id: property.id,
              selected: false,
              operation: defaultValue,
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
