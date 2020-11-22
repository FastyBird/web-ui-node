<template>
  <div
    :key="property.id"
    class="fb-triggers-select-action-device-property__container"
  >
    <list-item
      :variant="listItemTypes.DEFAULT"
      @click="handleToggleState"
      class="fb-triggers-select-action-device-property__property"
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

    <div class="fb-triggers-select-action-device-property__actions">
      <fb-form-radio-buttons-group
        ref="actionsGroupElement"
        v-if="property.isEnum"
        v-model="form.model.operation"
        :size="sizeTypes.SMALL"
        name="value"
      >
        <list-item
          v-for="(item, key) in property.format.split(',')"
          :key="key"
          :variant="listItemTypes.LIST"
          @click="form.model.operation = item"
          class="fb-triggers-select-action-device-property__action"
        >
          <template slot="heading">
            <template v-if="$t(`triggers.variations.actions.${item}`) !== `triggers.variations.actions.${item}`">
              {{ $t(`triggers.variations.actions.${item}`) }}
            </template>
            <template v-else>
              {{ item }}
            </template>
          </template>

          <template slot="detail">
            <fb-form-radio-button
              :label="item"
              :group="actionsGroupElement"
              :id="`value-${item}`"
              name="value"
            >
              <template v-if="$t(`triggers.variations.actions.${item}`) !== `triggers.variations.actions.${item}`">
                {{ $t(`triggers.variations.actions.${item}`) }}
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
        class="fb-triggers-select-action-device-property__action"
      >
        <template slot="heading">
          {{ $t('triggers.variations.state') }}
        </template>

        <template slot="detail-large">
          <fb-ui-switch-element
            :status="form.model.operation"
            :disabled="!form.model.selected"
            :variant="switchVariantTypes.PRIMARY"
            @change="handlePropertyChanged"
          />
        </template>
      </list-item>

      <list-item
        v-else
        :variant="listItemTypes.LIST"
        class="fb-triggers-select-action-device-property__action"
      >
        <template slot="heading">
          {{ $t('triggers.variations.value') }}
        </template>

        <template slot="detail-large">
          <fb-form-input
            v-model="form.model.operation"
            :size="sizeTypes.SMALL"
            name="operation"
            class="fb-triggers-select-action-device-property__action-operation"
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
  FbSizeTypes,
  FbFormRadioButtonsGroup,
  FbUiSwitchElementVariantTypes,
} from '@fastybird/web-ui-theme'

import { DevicePropertyInterface } from '~/models/devices-node/device-properties/types'
import { ChannelPropertyInterface } from '~/models/devices-node/channel-properties/types'

import { ListItemSizeTypes } from '~/components/layout/ListItem/index.vue'

interface TriggersSelectActionDevicePropertyFormInterface {
  model: {
    selected: boolean
    operation: string | boolean | null
  }
}

interface TriggersSelectActionDevicePropertyValueInterface {
  selected: boolean
  operation: string | boolean | null
}

interface TriggersSelectActionDevicePropertyPropsInterface {
  value: TriggersSelectActionDevicePropertyValueInterface
  property: DevicePropertyInterface | ChannelPropertyInterface
}

export default defineComponent({

  name: 'TriggersSelectActionDeviceProperty',

  props: {

    value: {
      type: Object as PropType<TriggersSelectActionDevicePropertyValueInterface>,
      required: true,
    },

    property: {
      type: Object as PropType<DevicePropertyInterface | ChannelPropertyInterface>,
      required: true,
    },

  },

  setup(props: TriggersSelectActionDevicePropertyPropsInterface, context: SetupContext) {
    const isMounted = ref<boolean>(false)

    const actionsGroupElement = ref<InstanceType<typeof FbFormRadioButtonsGroup> | null>(null)

    const form = reactive<TriggersSelectActionDevicePropertyFormInterface>({
      model: {
        selected: props.value.selected,
        operation: props.value.operation,
      },
    })

    function emitUpdate(): void {
      context.emit('input', Object.assign(props.value, {
        selected: form.model.selected,
        operation: form.model.operation,
      }))

      Object.assign(props.value, {
        selected: form.model.selected,
        operation: form.model.operation,
      })
    }

    function handlePropertyChanged(): void {
      form.model.operation = !form.model.operation

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
      () => form.model.operation,
      (val): void => {
        if (val !== props.value.operation && isMounted.value) {
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
      actionsGroupElement,
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
