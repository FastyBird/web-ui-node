<template>
  <list-item
    :key="property.id"
    class="fb-routines-edit-condition-thing__channel-property"
    @click="toggleState"
  >
    <template
      slot="icon"
    >
      <fb-form-checkbox
        v-model="stateModel"
        :name="`property_${property.id}`"
      />
    </template>

    <template slot="heading">
      {{ $tChannelProperty(thing, property) }}
    </template>

    <template slot="detail-large">
      <fb-switch-element
        v-if="property.isBoolean"
        :status="operandModel"
        :disabled="!stateModel"
        variant="primary"
        @change="propertyChanged"
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
        class="fb-routines-edit-condition-thing__channel-property-combined-operand"
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
  </list-item>
</template>

<script>
export default {

  name: 'RoutinesEditEditConditionChannelsProperty',

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

    operator() {
      return [
        {
          value: 'below',
          name: '<',
        }, {
          value: 'eq',
          name: '=',
        }, {
          value: 'above',
          name: '>',
        },
      ]
    },

    stateModel: {
      get() {
        const row = this._.get(this.value, 'rows', []).find(({ property_id }) => property_id === this.property.id)

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
              this.value.rows[j].property_id === this.property.id
            ) {
              this.value.rows[j].selected = val
            }
          }

          parent.$emit.apply(parent, ['input'].concat([this.value]))
        }
      },
    },

    operandModel: {
      get() {
        const row = this._.get(this.value, 'rows', []).find(({ property_id }) => property_id === this.property.id)

        if (typeof row !== 'undefined') {
          return row.operand
        }

        return null
      },
      set(val) {
        const parent = this.$parent || this.$root

        if (parent) {
          for (const j in this.value.rows) {
            if (
              Object.prototype.hasOwnProperty.call(this.value.rows, j) &&
              this.value.rows[j].property_id === this.property.id
            ) {
              this.value.rows[j].operand = val
            }
          }

          parent.$emit.apply(parent, ['input'].concat([this.value]))
        }
      },
    },

    operatorModel: {
      get() {
        const row = this._.get(this.value, 'rows', []).find(({ property_id }) => property_id === this.property.id)

        if (typeof row !== 'undefined') {
          return row.operator
        }

        return null
      },
      set(val) {
        const parent = this.$parent || this.$root

        if (parent) {
          for (const j in this.value.rows) {
            if (
              Object.prototype.hasOwnProperty.call(this.value.rows, j) &&
              this.value.rows[j].property_id === this.property.id
            ) {
              this.value.rows[j].operator = val
            }
          }

          parent.$emit.apply(parent, ['input'].concat([this.value]))
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
              name: this.$te(`variations.${value.trim()}`) ? this.$t(`routines.variations.${value.trim()}`) : value.trim(),
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
