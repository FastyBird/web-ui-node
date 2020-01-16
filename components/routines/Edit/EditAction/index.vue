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

    <fb-button
      v-if="action !== null"
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

  },

  data() {
    return {
      model: {},
    }
  },

  computed: {

    groupedProperties() {
      return {
        analog: this.analogActorsProperties,
        binary: this.binaryActorsProperties,
        lights: this.lightProperties,
        switches: this.switchProperties,
      }
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
     * Get all relay switch properties
     *
     * @returns {Array}
     */
    switchProperties() {
      return this._.filter(this._.get(this.thing, 'channel.properties', []), 'isSwitch')
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
