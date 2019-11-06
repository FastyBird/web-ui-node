<template>
  <layout-list-item
    :key="channel.id + '-' + property.id"
    class="fb-routines-edit-condition-thing__channel-property"
    @click="toggleState"
  >
    <template
      slot="icon"
    >
      <fb-form-checkbox
        v-model="stateModel"
        :name="`property_${property.id}`"
        class="p-y-0"
        style="margin: -3px 0 0 0;"
      />
    </template>

    <template slot="heading">
      {{ $tChannelProperty(thing, channel, property) }}
    </template>

    <template slot="sub-heading">
      {{ $tChannel(thing, channel) }}
    </template>

    <template slot="detail-large">
      <switch-element
        v-if="property.isBoolean"
        :status="operandModel"
        :disabled="!stateModel"
        @change="propertyChanged(property)"
      />

      <fb-form-select
        v-else-if="property.isEnum"
        v-model="operandModel"
        :items="actions"
        name="operand"
        size="sm"
      />

      <div
        v-else
        class="combined"
      >
        <fb-form-select
          v-model="operatorModel"
          :items="operator"
          name="operator"
          size="sm"
        />

        <fb-form-input
          v-model="operandModel"
          name="operand"
          size="sm"
        />
      </div>
    </template>
  </layout-list-item>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'
  import SwitchElement from '@/components/layout/SwitchElement'

  export default {

    name: 'RoutinesEditEditConditionChannelsProperty',

    components: {
      LayoutListItem,
      SwitchElement,
    },

    props: {

      value: {
        type: Array,
        required: true,
      },

      thing: {
        type: Object,
        required: true,
      },

      channel: {
        type: Object,
        required: true,
      },

      property: {
        type: Object,
        required: true,
      },

      condition: {
        type: Object,
        default: null,
      },

    },

    computed: {

      operator() {
        return [
          {
            value: 'above',
            name: '<',
          }, {
            value: 'eq',
            name: '=',
          }, {
            value: 'below',
            name: '>',
          },
        ]
      },

      stateModel: {
        get() {
          const channel = this.value.find(item => {
            return item.channel === this.channel.id
          })

          if (typeof channel !== 'undefined') {
            const property = channel.properties.find(item => {
              return item.property === this.property.id
            })

            if (typeof property !== 'undefined') {
              return !!property.selected
            }
          }

          return false
        },
        set(val) {
          const parent = this.$parent || this.$root

          if (parent) {
            const result = []

            for (const i in this.value) {
              if (
                this.value.hasOwnProperty(i) &&
                this.value[i].channel === this.channel.id
              ) {
                const channel = this.value[i]

                for (const j in channel.properties) {
                  if (
                    channel.properties.hasOwnProperty(j) &&
                    channel.properties[j].property === this.property.id
                  ) {
                    channel.properties[j].selected = val
                  }
                }

                result.push(channel)
              } else {
                result.push(this.value[i])
              }

              parent.$emit.apply(parent, ['input'].concat([result]))
            }
          }
        },
      },

      operandModel: {
        get() {
          const channel = this.value.find(item => {
            return item.channel === this.channel.id
          })

          if (typeof channel !== 'undefined') {
            const property = channel.properties.find(item => {
              return item.property === this.property.id
            })

            if (typeof property !== 'undefined') {
              return property.operand
            }
          }

          return null
        },
        set(val) {
          const parent = this.$parent || this.$root

          if (parent) {
            const result = []

            for (const i in this.value) {
              if (
                this.value.hasOwnProperty(i) &&
                this.value[i].channel === this.channel.id
              ) {
                const channel = this.value[i]

                for (const j in channel.properties) {
                  if (
                    channel.properties.hasOwnProperty(j) &&
                    channel.properties[j].property === this.property.id
                  ) {
                    channel.properties[j].operand = val
                  }
                }

                result.push(channel)
              } else {
                result.push(this.value[i])
              }

              parent.$emit.apply(parent, ['input'].concat([result]))
            }
          }
        },
      },

      operatorModel: {
        get() {
          const channel = this.value.find(item => {
            return item.channel === this.channel.id
          })

          if (typeof channel !== 'undefined') {
            const property = channel.properties.find(item => {
              return item.property === this.property.id
            })

            if (typeof property !== 'undefined') {
              return property.operator
            }
          }

          return null
        },
        set(val) {
          const parent = this.$parent || this.$root

          if (parent) {
            const result = []

            for (const i in this.value) {
              if (
                this.value.hasOwnProperty(i) &&
                this.value[i].channel === this.channel.id
              ) {
                const channel = this.value[i]

                for (const j in channel.properties) {
                  if (
                    channel.properties.hasOwnProperty(j) &&
                    channel.properties[j].property === this.property.id
                  ) {
                    channel.properties[j].operator = val
                  }
                }

                result.push(channel)
              } else {
                result.push(this.value[i])
              }

              parent.$emit.apply(parent, ['input'].concat([result]))
            }
          }
        },
      },

      actions() {
        const options = []

        if (this.property !== null) {
          if (this.property.isNumber) {

          } else if (this.property.isBoolean) {

          } else if (this.property.isString) {

          } else if (this.property.isEnum) {
            const values = this.property.format.split(',')

            for (const value of values) {
              options.push({
                value: value.trim(),
                name: this.$te(`variations.${value.trim()}`) ? this.$t(`variations.${value.trim()}`) : value.trim(),
              })
            }
          }
        }

        return options
      },

    },

    watch: {

      operandModel() {
        if (this.stateModel === false) {
          this.stateModel = !this.stateModel
        }
      },

    },

    methods: {

      propertyChanged() {
        // Just placeholder
      },

      toggleState(event) {
        const path = this.getEventElementsPath(event)

        for (const pathItem of path) {
          if (
            typeof pathItem.getAttribute === 'function' &&
            (
              pathItem.tagName.toLowerCase() === 'input' || pathItem.tagName.toLowerCase() === 'select' || pathItem.tagName.toLowerCase() === 'label'
            )
          ) {
            return
          }
        }

        this.stateModel = !this.stateModel
      },

    },

  }
</script>

<i18n src="./locales.json" />
