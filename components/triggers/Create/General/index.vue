<template>
  <div class="fb-triggers-create-general__container">
    <validation-observer
      ref="validator"
      class="fb-triggers-create-general__general"
    >
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
            @blur="handleUpdate"
            name="triggerName"
          />
        </fb-ui-content>
      </validation-provider>

      <fb-form-text-area
        v-model="form.model.comment"
        :label="$t('triggers.fields.triggerComment.title')"
        :placeholder="$t('triggers.fields.triggerComment.placeholder')"
        :tab-index="3"
        @blur="handleUpdate"
        name="triggerComment"
      />
    </validation-observer>

    <div class="fb-triggers-create-general__items-container">
      <template v-if="isDeviceCondition || isSensorCondition">
        <fb-ui-items-container class="fb-triggers-create-general__items">
          <template slot="heading">
            {{ $tc('triggers.headings.conditions', conditions.length, { count: conditions.length }) }}
          </template>

          <fb-ui-button
            v-if="conditions.length === 0"
            :variant="buttonVariantTypes.OUTLINE_DEFAULT"
            :size="sizeTypes.LARGE"
            @click="$emit('addCondition')"
            block
            class="fb-triggers-create-general__add-item-row"
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
        <fb-ui-items-container class="fb-triggers-create-general__items">
          <template slot="heading">
            {{ $t('triggers.headings.scheduledTime') }}
          </template>

          <fb-ui-button
            v-if="schedule === null"
            :variant="buttonVariantTypes.OUTLINE_DEFAULT"
            :size="sizeTypes.LARGE"
            @click="$emit('addTimeSchedule')"
            block
            class="fb-triggers-create-general__add-item-row"
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
        <fb-ui-items-container class="fb-triggers-create-general__items">
          <template slot="heading">
            {{ $t('triggers.headings.scheduledDate') }}
          </template>

          <fb-ui-button
            v-if="schedule === null"
            :variant="buttonVariantTypes.OUTLINE_DEFAULT"
            :size="sizeTypes.LARGE"
            @click="$emit('addDateSchedule')"
            block
            class="fb-triggers-create-general__add-item-row"
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

      <fb-ui-items-container class="fb-triggers-create-general__items">
        <template slot="heading">
          {{ $tc('triggers.headings.actions', actions.length, { count: actions.length }) }}
        </template>

        <fb-ui-button
          v-if="actions.length === 0"
          :variant="buttonVariantTypes.OUTLINE_DEFAULT"
          :size="sizeTypes.LARGE"
          @click="$emit('addAction')"
          block
          class="fb-triggers-create-general__add-item-row"
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
    </div>
  </div>
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
  FbFormResultTypes,
} from '@fastybird/web-ui-theme'

import Trigger from '~/models/triggers-node/triggers/Trigger'
import { TriggerInterface } from '~/models/triggers-node/triggers/types'
import Action from '~/models/triggers-node/actions/Action'
import { ActionInterface } from '~/models/triggers-node/actions/types'
import Condition from '~/models/triggers-node/conditions/Condition'
import {
  ConditionEntityTypes,
  ConditionInterface,
} from '~/models/triggers-node/conditions/types'

import TriggersListCondition from '~/components/triggers/ListCondition/index.vue'
import TriggersListAction from '~/components/triggers/ListAction/index.vue'

import { TriggerTypes } from '~/components/triggers/Create/create'

interface TriggersCreateFormInterface {
  model: {
    name: string
    comment: string | null
  }
}

interface TriggersCreatePropsInterface {
  trigger: TriggerInterface
  type: TriggerTypes
  remoteFormSubmit: boolean
  remoteFormResult: FbFormResultTypes
}

export default defineComponent({

  name: 'TriggersCreateGeneral',

  props: {

    trigger: {
      type: Object as PropType<TriggerInterface>,
      required: true,
    },

    type: {
      type: String as PropType<TriggerTypes>,
      required: true,
    },

    remoteFormSubmit: {
      type: Boolean,
      default: false,
    },

    remoteFormResult: {
      type: String as PropType<FbFormResultTypes>,
      default: FbFormResultTypes.NONE,
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

    const isTimeScheduled = ref<boolean>(props.type === TriggerTypes.TIME_SCHEDULED)
    const isDateScheduled = ref<boolean>(props.type === TriggerTypes.DATE_SCHEDULED)
    const isDeviceCondition = ref<boolean>(props.type === TriggerTypes.DEVICE)
    const isSensorCondition = ref<boolean>(props.type === TriggerTypes.SENSOR)
    const isManual = ref<boolean>(props.type === TriggerTypes.MANUAL)

    const schedule = computed<ConditionInterface | null>((): ConditionInterface | null => {
      return Condition
        .query()
        .where('triggerId', props.trigger.id)
        .where('type', (value: ConditionEntityTypes): boolean => {
          return value === ConditionEntityTypes.TIME || value === ConditionEntityTypes.DATE
        })
        .first()
    })

    const conditions = computed<Array<ConditionInterface>>((): Array<ConditionInterface> => {
      return Condition
        .query()
        .where('triggerId', props.trigger.id)
        .where('type', (value: ConditionEntityTypes): boolean => {
          return value !== ConditionEntityTypes.TIME && value !== ConditionEntityTypes.DATE
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

    let timer: number

    function created(): void {
      window.clearInterval(timer)

      context.emit('created')
    }

    function submit(): void {
      context.emit('update:remoteFormSubmit', false)

      context.emit('update:remoteFormResult', FbFormResultTypes.WORKING)

      if (validator.value !== null) {
        validator.value
          .validate()
          .then(async(success: boolean): Promise<void> => {
            if (success) {
              try {
                await Trigger.dispatch('save', {
                  trigger: props.trigger,
                })

                context.emit('update:remoteFormResult', FbFormResultTypes.OK)

                timer = window.setInterval(created, 2000)
              } catch {
                context.emit('update:remoteFormResult', FbFormResultTypes.ERROR)

                timer = window.setInterval(() => {
                  context.emit('update:remoteFormResult', FbFormResultTypes.NONE)

                  window.clearInterval(timer)
                }, 2000)
              }
            } else {
              context.emit('update:remoteFormResult', FbFormResultTypes.NONE)
            }
          })
      }
    }

    function handleUpdate(): void {
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
      (): boolean => props.remoteFormSubmit,
      (val): void => {
        if (val) {
          submit()
        }
      },
    )

    watch(
      (): string => props.type,
      (val): void => {
        isTimeScheduled.value = val === TriggerTypes.TIME_SCHEDULED
        isDateScheduled.value = val === TriggerTypes.DATE_SCHEDULED
        isDeviceCondition.value = val === TriggerTypes.DEVICE
        isSensorCondition.value = val === TriggerTypes.SENSOR
        isManual.value = val === TriggerTypes.MANUAL
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
      handleUpdate,
      sizeTypes: FbSizeTypes,
      buttonVariantTypes: FbUiButtonVariantTypes,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
