<template>
  <layout-list-item
    :key="channel.id + '-' + property.id"
    class="fb-routines-edit-action-thing__channel-property"
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
      <fb-form-radio-buttons-group
        v-if="property.isEnum"
        v-model="operationModel"
        name="value"
        button
        size="sm"
        variant="primary"
        class="pull-right fb-routines-edit-action-thing__values"
      >
        <fb-form-radio-button
          v-for="(item, key) in property.format.split(',')"
          :key="key"
          :label="item"
          name="value"
        >
          <template v-if="$te(`variations.${item}`)">
            {{ $t(`variations.${item}`) }}
          </template>
          <template v-else>
            {{ item }}
          </template>
        </fb-form-radio-button>
      </fb-form-radio-buttons-group>

      <switch-element
        v-if="property.isBoolean"
        :status="operationModel"
        :disabled="!stateModel"
        @change="propertyChanged(property)"
      />
    </template>
  </layout-list-item>
</template>

<script>
  import LayoutListItem from '@/components/layout/ListItem'
  import SwitchElement from '@/components/layout/SwitchElement'

  export default {

    name: 'RoutinesEditEditActionChannelsProperty',

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

      action: {
        type: Object,
        default: null,
      },

    },

    computed: {

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

      operationModel: {
        get() {
          const channel = this.value.find(item => {
            return item.channel === this.channel.id
          })

          if (typeof channel !== 'undefined') {
            const property = channel.properties.find(item => {
              return item.property === this.property.id
            })

            if (typeof property !== 'undefined') {
              return property.operation
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
                    channel.properties[j].operation = val
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

    },

    watch: {

      operationModel() {
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
