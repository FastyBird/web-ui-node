<template>
  <div
    :key="property.id"
    class="fb-triggers-select-condition-device-property__container"
  >
    <list-item
      :variant="listItemTypes.DEFAULT"
      @click="handleToggleState"
      class="fb-triggers-select-condition-device-property__property"
    >
      <template slot="heading">
        {{ property.title }}
      </template>

      <template slot="detail">
        <fb-form-checkbox
          v-model="form.model.selected"
          :name="`property_${property.property}`"
        />
      </template>
    </list-item>

    <div class="fb-triggers-select-condition-device-property__conditions">
      <fb-form-radio-buttons-group
        ref="conditionsGroupElement"
        v-if="property.isEnum"
        v-model="form.model.operand"
        :size="sizeTypes.SMALL"
        name="value"
      >
        <list-item
          v-for="(item, key) in property.format.split(',')"
          :key="key"
          :variant="listItemTypes.LIST"
          @click="form.model.operand = item"
          class="fb-triggers-select-condition-device-property__condition"
        >
          <template slot="heading">
            <template v-if="$t(`triggers.variations.conditions.${item}`) !== `triggers.variations.conditions.${item}`">
              {{ $t(`triggers.variations.conditions.${item}`) }}
            </template>
            <template v-else>
              {{ item }}
            </template>
          </template>

          <template slot="detail">
            <fb-form-radio-button
              :label="item"
              :group="conditionsGroupElement"
              :id="`value-${item}`"
              name="value"
            >
              <template
                v-if="$t(`triggers.variations.conditions.${item}`) !== `triggers.variations.conditions.${item}`"
              >
                {{ $t(`triggers.variations.conditions.${item}`) }}
              </template>
              <template v-else>
                {{ item }}
              </template>
            </fb-form-radio-button>
          </template>
        </list-item>
      </fb-form-radio-buttons-group>

      <list-item
        v-else-if="property.isBoolean"
        :variant="listItemTypes.LIST"
        @click="handlePropertyChanged"
        class="fb-triggers-select-condition-device-property__condition"
      >
        <template slot="heading">
          {{ $t('triggers.variations.state') }}
        </template>

        <template slot="detail-large">
          <fb-ui-switch-element
            :status="form.model.operand"
            :disabled="!form.model.selected"
            :variant="switchVariantTypes.PRIMARY"
            @change="handlePropertyChanged"
          />
        </template>
      </list-item>

      <list-item
        v-else
        :variant="listItemTypes.LIST"
        class="fb-triggers-select-condition-device-property__condition"
      >
        <template slot="heading">
          {{ $t('triggers.variations.value') }}
        </template>

        <template slot="detail-large">
          <fb-form-select
            v-model="form.model.operator"
            :items="operator"
            :size="sizeTypes.SMALL"
            name="operator"
            class="fb-triggers-select-condition-device-property__condition-operator"
          />

          <fb-form-input
            v-model="form.model.operand"
            :size="sizeTypes.SMALL"
            name="operand"
            class="fb-triggers-select-condition-device-property__condition-operand"
          />

          <span
            v-if="property.unit !== null"
            class="fb-triggers-select-action-device-property__action-operation-unit"
          >
            {{ property.unit }}
          </span>
        </template>
      </list-item>
    </div>
  </div>
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

import {
  FbFormRadioButtonsGroup,
  FbSizeTypes,
  FbUiSwitchElementVariantTypes,
} from '@fastybird/web-ui-theme'

import { ConditionOperatorTypes } from '~/models/triggers-module/types'

import { DevicePropertyInterface } from '~/models/devices-module/device-properties/types'
import { ChannelPropertyInterface } from '~/models/devices-module/channel-properties/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

interface TriggersSelectConditionDevicePropertyFormInterface {
  model: {
    selected: boolean
    operator: ConditionOperatorTypes
    operand: string | boolean | null
  }
}

interface TriggersSelectConditionDevicePropertyValueInterface {
  selected: boolean
  operator: ConditionOperatorTypes
  operand: string | boolean | null
}

interface TriggersSelectConditionDevicePropertyPropsInterface {
  value: TriggersSelectConditionDevicePropertyValueInterface
  property: DevicePropertyInterface | ChannelPropertyInterface
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

    const conditionsGroupElement = ref<InstanceType<typeof FbFormRadioButtonsGroup> | null>(null)

    const form = reactive<TriggersSelectConditionDevicePropertyFormInterface>({
      model: {
        selected: props.value.selected,
        operator: props.value.operator,
        operand: props.value.operand,
      },
    })

    const operator = [
      {
        value: ConditionOperatorTypes.STATE_VALUE_BELOW,
        name: '<',
      }, {
        value: ConditionOperatorTypes.STATE_VALUE_EQUAL,
        name: '=',
      }, {
        value: ConditionOperatorTypes.STATE_VALUE_ABOVE,
        name: '>',
      },
    ]

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

    function handlePropertyChanged(): void {
      form.model.operand = !form.model.operand

      emitUpdate()
    }

    function handleToggleState(event: MouseEvent): void {
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

    onMounted((): void => {
      isMounted.value = true
    })

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
      conditionsGroupElement,
      handlePropertyChanged,
      handleToggleState,
      listItemTypes: ListItemSizeTypes,
      sizeTypes: FbSizeTypes,
      switchVariantTypes: FbUiSwitchElementVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
