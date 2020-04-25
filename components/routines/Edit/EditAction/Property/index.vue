<template>
  <list-item
    :key="property.id"
    class="fb-routines-edit-action-thing__channel-property"
    @click="toggleState"
  >
    <template
      slot="icon"
    >
      <fb-form-checkbox
        v-model="stateModel"
        :name="`property_${property.property}`"
      />
    </template>

    <template slot="heading">
      {{ $tChannelProperty(thing, property) }}
    </template>

    <template slot="detail-large">
      <fb-switch-element
        v-if="property.isBoolean"
        :status="operationModel"
        :disabled="!stateModel"
        variant="primary"
        @change="propertyChanged"
      />

      <fb-form-radio-buttons-group
        v-else-if="property.isEnum"
        v-model="operationModel"
        name="value"
        button
        size="sm"
        variant="primary"
        class="fb-routines-edit-action-thing__values"
      >
        <fb-form-radio-button
          v-for="(item, key) in property.format.split(',')"
          :key="key"
          :label="item"
          name="value"
        >
          <template v-if="$te(`variations.${item}`)">
            {{ $t(`routines.variations.${item}`) }}
          </template>
          <template v-else>
            {{ item }}
          </template>
        </fb-form-radio-button>
      </fb-form-radio-buttons-group>
    </template>
  </list-item>
</template>

<script>
export default {

  name: 'RoutinesEditEditActionChannelsProperty',

  props: {

    value: {
      type: Object,
      required: true,
    },

    thing: {
      type: Object,
      required: true,
    },

    property: {
      type: Object,
      required: true,
    },

  },

  computed: {

    stateModel: {
      get() {
        const row = this.value.rows.find(({ property }) => property === this.property.property)

        if (typeof row !== 'undefined') {
          return !!row.selected
        }

        return false
      },
      set(val) {
        const parent = this.$parent || this.$root

        if (parent) {
          for (const j in this.value.rows) {
            if (
              Object.prototype.hasOwnProperty.call(this.value.rows, j) &&
              this.value.rows[j].property === this.property.property
            ) {
              this.value.rows[j].selected = val
            }
          }

          parent.$emit.apply(parent, ['input'].concat([this.value]))
        }
      },
    },

    operationModel: {
      get() {
        const row = this.value.rows.find(({ property }) => property === this.property.property)

        if (typeof row !== 'undefined') {
          return row.operation
        }

        return null
      },
      set(val) {
        const parent = this.$parent || this.$root

        if (parent) {
          for (const j in this.value.rows) {
            if (
              Object.prototype.hasOwnProperty.call(this.value.rows, j) &&
              this.value.rows[j].property === this.property.property
            ) {
              this.value.rows[j].operation = val
            }
          }

          parent.$emit.apply(parent, ['input'].concat([this.value]))
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
      this.operationModel = !this.operationModel
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
