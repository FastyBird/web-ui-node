<template>
  <list-item
    :key="property.id"
    class="fb-triggers-select-condition-device-property__container"
    @click="toggleState"
  >
    <template slot="icon">
      <fb-form-checkbox
        v-model="form.model.selected"
        :name="`property_${property.property}`"
      />
    </template>

    <template slot="heading">
      {{ property.title }}
    </template>

    <template slot="detail-large">
      <fb-ui-switch-element
        v-if="property.isBoolean"
        :status="form.model.operand"
        :disabled="!form.model.selected"
        variant="primary"
        @change="propertyChanged"
      />

      <fb-form-select
        v-else-if="property.isEnum"
        v-model="form.model.operand"
        :items="actions"
        name="operand"
        size="sm"
      />

      <div
        v-else
        class="fb-triggers-select-condition-device-property__channel-property-combined-operand"
      >
        <fb-form-select
          v-model="form.model.operator"
          :items="operator"
          name="operator"
          size="sm"
          class="fb-triggers-select-condition-device-property__channel-property-combined-operand-operator"
        />

        <fb-form-input
          v-model="form.model.operand"
          name="operand"
          size="sm"
          class="fb-triggers-select-condition-device-property__channel-property-combined-operand-operand"
        />
      </div>
    </template>
  </list-item>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import get from 'lodash/get'

import { ConditionOperatorType } from '~/models/triggers-node/types'

import { DevicePropertyInterface } from '~/models/devices-node/device-properties/types'
import { ChannelPropertyInterface } from '~/models/devices-node/channel-properties/types'

interface TriggersSelectConditionDevicePropertyValueInterface {
  selected: boolean
  operator: ConditionOperatorType
  operand: string | boolean | null
}

interface TriggersSelectConditionDevicePropertyPropsInterface {
  value: TriggersSelectConditionDevicePropertyValueInterface
  property: DevicePropertyInterface | ChannelPropertyInterface
}

interface TriggersSelectConditionDevicePropertyFormInterface {
  model: {
    selected: boolean
    operator: ConditionOperatorType
    operand: string | boolean | null
  }
}

export default defineComponent({

  name: 'TriggersSelectConditionDeviceProperty',

  props: {

    value: {
      type: Object as PropType<TriggersSelectConditionDevicePropertyValueInterface>,
      required: true,
    },

    property: {
      type: Object as PropType<DevicePropertyInterface | ChannelPropertyInterface>,
      required: true,
    },

  },

  setup(props: TriggersSelectConditionDevicePropertyPropsInterface, context: SetupContext) {
    const isMounted = ref<boolean>(false)

    const form = reactive<TriggersSelectConditionDevicePropertyFormInterface>({
      model: {
        selected: props.value.selected,
        operator: props.value.operator,
        operand: props.value.operand,
      },
    })

    const operator = [
      {
        value: ConditionOperatorType.STATE_VALUE_BELOW,
        name: '<',
      }, {
        value: ConditionOperatorType.STATE_VALUE_EQUAL,
        name: '=',
      }, {
        value: ConditionOperatorType.STATE_VALUE_ABOVE,
        name: '>',
      },
    ]

    const actions = []

    if (props.property.isNumber) {

    } else if (props.property.isBoolean) {

    } else if (props.property.isString) {

    } else if (props.property.isEnum && props.property.format !== null) {
      const values = props.property.format.split(',')

      for (const value of values) {
        actions.push({
          value: value.trim(),
          name: context.root.$te(`triggers.variations.${value.trim()}`) ? context.root.$t(`triggers.variations.${value.trim()}`) : value.trim(),
        })
      }

      if (form.model.operand === null) {
        form.model.operand = get(values, '[0]', null)
      }
    }

    onMounted((): void => {
      isMounted.value = true
    })

    function emitUpdate(): void {
      context.emit('input', Object.assign(props.value, {
        selected: form.model.selected,
        operator: form.model.operator,
        operand: form.model.operand,
      }))

      Object.assign(props.value, {
        selected: form.model.selected,
        operator: form.model.operator,
        operand: form.model.operand,
      })
    }

    function propertyChanged(): void {
      form.model.operand = !form.model.operand

      emitUpdate()
    }

    function toggleState(event: MouseEvent): void {
      const path = context.root.getEventElementsPath(event)

      const isFormElement = path.find((pathItem): boolean => {
        return 'getAttribute' in pathItem &&
          typeof pathItem.getAttribute === 'function' &&
          (
            pathItem.tagName.toLowerCase() === 'input' ||
            pathItem.tagName.toLowerCase() === 'select' ||
            pathItem.tagName.toLowerCase() === 'label'
          )
      })

      if (isFormElement) {
        return
      }

      form.model.selected = !form.model.selected
    }

    watch(
      () => form.model.operator,
      (val): void => {
        if (val !== props.value.operator && isMounted.value) {
          if (form.model.selected === false) {
            form.model.selected = true
          } else {
            emitUpdate()
          }
        }
      },
    )

    watch(
      () => form.model.operand,
      (val): void => {
        if (val !== props.value.operand && isMounted.value) {
          if (form.model.selected === false) {
            form.model.selected = true
          } else {
            emitUpdate()
          }
        }
      },
    )

    watch(
      () => form.model.selected,
      (val): void => {
        if (val !== props.value.selected && isMounted.value) {
          emitUpdate()
        }
      },
    )

    return {
      form,
      operator,
      actions,
      propertyChanged,
      toggleState,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
