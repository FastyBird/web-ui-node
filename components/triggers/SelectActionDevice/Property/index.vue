<template>
  <list-item
    :key="property.id"
    class="fb-triggers-select-action-device-property__container"
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
        :status="form.model.operation"
        :disabled="!form.model.selected"
        variant="primary"
        @change="propertyChanged"
      />

      <fb-form-radio-buttons-group
        v-else-if="property.isEnum"
        ref="actionsGroup"
        v-model="form.model.operation"
        name="value"
        button
        size="sm"
        variant="primary"
      >
        <template v-for="(item, key) in property.format.split(',')">
          <fb-form-radio-button
            :key="key"
            :label="item"
            :group="actionsGroup"
            name="value"
          >
            <template v-if="$te(`triggers.${item}`)">
              {{ $t(`triggers.variations.${item}`) }}
            </template>
            <template v-else>
              {{ item }}
            </template>
          </fb-form-radio-button>
        </template>
      </fb-form-radio-buttons-group>
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

import { FbFormRadioButtonsGroup } from '@fastybird/web-ui-theme'

import { DevicePropertyInterface } from '~/models/devices-node/device-properties/types'
import { ChannelPropertyInterface } from '~/models/devices-node/channel-properties/types'

interface TriggersSelectActionDevicePropertyValueInterface {
  selected: boolean
  operation: string | boolean | null
}

interface TriggersSelectActionDevicePropertyPropsInterface {
  value: TriggersSelectActionDevicePropertyValueInterface
  property: DevicePropertyInterface | ChannelPropertyInterface
}

interface TriggersSelectActionDevicePropertyFormInterface {
  model: {
    selected: boolean
    operation: string | boolean | null
  }
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
    const actionsGroup = ref<InstanceType<typeof FbFormRadioButtonsGroup> | null>(null)

    const form = reactive<TriggersSelectActionDevicePropertyFormInterface>({
      model: {
        selected: props.value.selected,
        operation: props.value.operation,
      },
    })

    onMounted((): void => {
      isMounted.value = true
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

    function propertyChanged(): void {
      form.model.operation = !form.model.operation

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
      propertyChanged,
      toggleState,
      actionsGroup,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
