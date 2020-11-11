<template>
  <validation-observer ref="validator">
    <validation-provider
      v-slot="{ errors }"
      name="triggerName"
      rules="required"
    >
      <fb-ui-content :mb="sizeTypes.MEDIUM">
        <fb-form-input
          v-model="form.model.name"
          :error="errors[0]"
          :has-error="errors.length > 0"
          :label="$t('triggers.fields.triggerName.title')"
          :placeholder="$t('triggers.fields.triggerName.placeholder')"
          :required="true"
          :tab-index="2"
          @blur="updateTrigger"
          name="triggerName"
        />
      </fb-ui-content>
    </validation-provider>

    <fb-ui-content :mb="sizeTypes.MEDIUM">
      <fb-form-text-area
        v-model="form.model.comment"
        :label="$t('triggers.fields.triggerComment.title')"
        :placeholder="$t('triggers.fields.triggerComment.placeholder')"
        :tab-index="3"
        @blur="updateTrigger"
        name="triggerComment"
      />
    </fb-ui-content>

    <template v-if="isDeviceCondition || isSensorCondition">
      <fb-ui-items-container class="fb-triggers-create__items">
        <template slot="heading">
          {{ $tc('triggers.headings.conditions', conditions.length, { count: conditions.length }) }}
        </template>

        <fb-ui-button
          v-if="conditions.length === 0"
          :variant="buttonVariantTypes.OUTLINE_DEFAULT"
          :size="sizeTypes.LARGE"
          @click="$emit('addCondition')"
          block
          class="fb-triggers-create__add-item-row"
        >
          <font-awesome-icon icon="plus-circle" />
          <span>{{ $t('triggers.buttons.addDevice.title') }}</span>
        </fb-ui-button>

        <triggers-list-condition
          v-for="condition in conditions"
          :key="condition.id"
          :trigger="trigger"
          :condition="condition"
        />

        <template
          slot="buttons"
          v-if="conditions.length > 0"
        >
          <fb-ui-button
            :variant="buttonVariantTypes.LINK"
            :size="sizeTypes.EXTRA_SMALL"
            @click="$emit('addCondition')"
          >
            <font-awesome-icon icon="plus" />
            {{ $t('application.buttons.add.title') }}
          </fb-ui-button>
        </template>
      </fb-ui-items-container>

      <hr>
    </template>

    <template v-if="isTimeScheduled">
      <fb-ui-items-container class="fb-triggers-create__items">
        <template slot="heading">
          {{ $t('triggers.headings.scheduledTime') }}
        </template>

        <fb-ui-button
          v-if="schedule === null"
          :variant="buttonVariantTypes.OUTLINE_DEFAULT"
          :size="sizeTypes.LARGE"
          @click="$emit('addTimeSchedule')"
          block
          class="fb-triggers-create__add-item-row"
        >
          <font-awesome-icon icon="plus-circle" />
          <span>{{ $t('triggers.buttons.addTime.title') }}</span>
        </fb-ui-button>

        <triggers-list-condition
          v-if="schedule !== null"
          :trigger="trigger"
          :condition="schedule"
        />
      </fb-ui-items-container>

      <hr>
    </template>

    <template v-if="isDateScheduled">
      <fb-ui-items-container class="fb-triggers-create__items">
        <template slot="heading">
          {{ $t('triggers.headings.scheduledDate') }}
        </template>

        <fb-ui-button
          v-if="schedule === null"
          :variant="buttonVariantTypes.OUTLINE_DEFAULT"
          :size="sizeTypes.LARGE"
          @click="$emit('addDateSchedule')"
          block
          class="fb-triggers-create__add-item-row"
        >
          <font-awesome-icon icon="plus-circle" />
          <span>{{ $t('triggers.buttons.addDate.title') }}</span>
        </fb-ui-button>

        <triggers-list-condition
          v-if="schedule !== null"
          :trigger="trigger"
          :condition="schedule"
        />
      </fb-ui-items-container>

      <hr>
    </template>

    <fb-ui-items-container class="fb-triggers-create__items">
      <template slot="heading">
        {{ $tc('triggers.headings.actions', actions.length, { count: actions.length }) }}
      </template>

      <fb-ui-button
        v-if="actions.length === 0"
        :variant="buttonVariantTypes.OUTLINE_DEFAULT"
        :size="sizeTypes.LARGE"
        @click="$emit('addAction')"
        block
        class="fb-triggers-create__add-item-row"
      >
        <font-awesome-icon icon="plus-circle" />
        <span>{{ $t('triggers.buttons.addAccessory.title') }}</span>
      </fb-ui-button>

      <triggers-list-action
        v-for="action in actions"
        :key="action.id"
        :trigger="trigger"
        :action="action"
      />

      <template
        slot="buttons"
        v-if="actions.length > 0"
      >
        <fb-ui-button
          :variant="buttonVariantTypes.LINK"
          :size="sizeTypes.EXTRA_SMALL"
          @click="$emit('addAction')"
        >
          <font-awesome-icon icon="plus" />
          {{ $t('application.buttons.add.title') }}
        </fb-ui-button>
      </template>
    </fb-ui-items-container>
  </validation-observer>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import {
  ValidationProvider,
  ValidationObserver,
  extend,
  localize,
} from 'vee-validate'

import {
  FbSizeTypes,
  FbUiButtonVariantTypes,
  FbFormResultType,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Action from '~/models/triggers-node/actions/Action'
import { ActionInterface } from '~/models/triggers-node/actions/types'
import Condition from '~/models/triggers-node/conditions/Condition'
import {
  ConditionEntityTypeType,
  ConditionInterface,
} from '~/models/triggers-node/conditions/types'

import TriggersListCondition from '~/components/triggers/ListCondition/index.vue'
import TriggersListAction from '~/components/triggers/ListAction/index.vue'

export enum TriggerType {
  TIME_SCHEDULED = 'timeScheduled',
  DATE_SCHEDULED = 'dateScheduled',
  DEVICE = 'device',
  SENSOR = 'sensor',
  MANUAL = 'manual',
}

interface TriggersCreatePropsInterface {
  trigger: TriggerInterface
  type: TriggerType
  remoteSubmit: boolean
  remoteFormResult: FbFormResultType
}

interface TriggersCreateFormInterface {
  model: {
    name: string
    comment: string | null
  }
}

export default defineComponent({

  name: 'TriggersCreate',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    type: {
      type: String as PropType<TriggerType>,
      required: true,
    },

    remoteSubmit: {
      type: Boolean,
      default: false,
    },

    remoteFormResult: {
      type: String as PropType<FbFormResultType>,
      default: FbFormResultType.NONE,
    },

  },

  components: {
    TriggersListCondition,
    TriggersListAction,

    ValidationProvider,
    ValidationObserver,
  },

  setup(props: TriggersCreatePropsInterface, context: SetupContext) {
    const windowSize = computed<string>((): string => {
      return context.root.$store.state.app.windowSize
    })

    const validator = ref<InstanceType<typeof ValidationObserver>>(null)

    const isTimeScheduled = ref<boolean>(props.type === TriggerType.TIME_SCHEDULED)
    const isDateScheduled = ref<boolean>(props.type === TriggerType.DATE_SCHEDULED)
    const isDeviceCondition = ref<boolean>(props.type === TriggerType.DEVICE)
    const isSensorCondition = ref<boolean>(props.type === TriggerType.SENSOR)
    const isManual = ref<boolean>(props.type === TriggerType.MANUAL)

    const schedule = computed<ConditionInterface | null>((): ConditionInterface | null => {
      return Condition
        .query()
        .where('triggerId', props.trigger.id)
        .where('type', ConditionEntityTypeType.TIME)
        .first()
    })

    const conditions = computed<Array<ConditionInterface>>((): Array<ConditionInterface> => {
      return Condition
        .query()
        .where('triggerId', props.trigger.id)
        .where('type', (value: ConditionEntityTypeType): boolean => {
          return value !== ConditionEntityTypeType.TIME && value !== ConditionEntityTypeType.DATE
        })
        .all()
    })

    const actions = computed<Array<ActionInterface>>((): Array<ActionInterface> => {
      return Action
        .query()
        .where('triggerId', props.trigger.id)
        .all()
    })

    const form = reactive<TriggersCreateFormInterface>({
      model: {
        name: props.trigger.name,
        comment: props.trigger.comment,
      },
    })

    localize({
      en: {
        fields: {
          triggerName: {
            required: context.root.$t('triggers.fields.triggerName.validation.required').toString(),
          },
        },
      },
    })

    extend('required', {
      validate: (value) => {
        return {
          required: true,
          valid: !['', null, undefined].includes(value),
        }
      },
      computesRequired: true,
    })

    // Processing timer
    let timer: number

    // Close opened window
    function close(): void {
      window.clearInterval(timer)

      context.emit('close')
    }

    function submit(): void {
      context.emit('update:remoteSubmit', false)

      context.emit('update:remoteFormResult', FbFormResultType.WORKING)

      if (validator.value !== null) {
        validator.value
          .validate()
          .then(async(success: boolean): Promise<void> => {
            if (success) {
              try {
                await Trigger.dispatch('save', {
                  trigger: props.trigger,
                })

                context.emit('update:remoteFormResult', FbFormResultType.OK)

                timer = window.setInterval(close, 2000)
              } catch {
                context.emit('update:remoteFormResult', FbFormResultType.ERROR)

                timer = window.setInterval(() => {
                  context.emit('update:remoteFormResult', FbFormResultType.NONE)

                  window.clearInterval(timer)
                }, 2000)
              }
            } else {
              context.emit('update:remoteFormResult', FbFormResultType.NONE)
            }
          })
      }
    }

    function updateTrigger(): void {
      Trigger.dispatch('edit', {
        trigger: props.trigger,
        data: {
          name: form.model.name,
          comment: form.model.comment,
        },
      })
        .catch(() => {
          context.root.$nuxt.error({ statusCode: 503, message: 'Something went wrong' })
        })
    }

    watch(
      (): boolean => props.remoteSubmit,
      (val): void => {
        if (val) {
          submit()
        }
      },
    )

    watch(
      (): string => props.type,
      (val): void => {
        isTimeScheduled.value = val === TriggerType.TIME_SCHEDULED
        isDateScheduled.value = val === TriggerType.DATE_SCHEDULED
        isDeviceCondition.value = val === TriggerType.DEVICE
        isSensorCondition.value = val === TriggerType.SENSOR
        isManual.value = val === TriggerType.MANUAL
      },
    )

    return {
      windowSize,
      validator,
      isTimeScheduled,
      isDateScheduled,
      isDeviceCondition,
      isSensorCondition,
      isManual,
      schedule,
      conditions,
      actions,
      form,
      updateTrigger,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
