<template>
  <div class="fb-routines-edit-action-thing__container">
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
  </div>
</template>

<script>
import Property from './Property'

import ChannelProperty from '~/models/devices-node/ChannelProperty'

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
          !Object.prototype.hasOwnProperty.call(value, 'device') ||
          !Object.prototype.hasOwnProperty.call(value, 'channel') ||
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
      actors: [],
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

      const action = {
        device: this.action ? this.action.device : this.thing.device.identifier,
        channel: this.action ? this.action.channel : this.thing.channel.channel,
        enabled: this.action ? this.action.enabled : true,
        rows: this._.filter(this.model.rows, 'selected')
          .map((row) => {
            return {
              property: row.property,
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
      this.actors
        .forEach((property) => {
          let defaultValue = null

          if (property.isBoolean) {
            defaultValue = true
          } else if (property.isEnum) {
            defaultValue = this._getPropertyDefaultValue(property)
          }

          if (this.action) {
            const storedProperty = this.action.rows.find(row => row.property === property.property)

            if (typeof storedProperty !== 'undefined') {
              this.model.rows.push({
                property: property.property,
                selected: true,
                operation: storedProperty.operation,
              })
            } else {
              this.model.rows.push({
                property: property.property,
                selected: false,
                operation: defaultValue,
              })
            }
          } else {
            this.model.rows.push({
              property: property.property,
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
