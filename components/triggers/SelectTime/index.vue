<template>
  <div class="fb-triggers-select-time__container">
    <h3>{{ $t('triggers.fields.conditionTime.title') }}</h3>

    <scroll-picker-group>
      <scroll-picker
        v-model="form.model.hour"
        :options="hours"
      />
      <scroll-picker
        v-model="form.model.minute"
        :options="minutes"
      />
      <scroll-picker
        v-if="!show24hours"
        v-model="form.model.ampm"
        :options="ampm"
      />
    </scroll-picker-group>

    <h3>{{ $t('triggers.fields.conditionRepeat.title') }}</h3>

    <fb-form-checkboxes-group
      ref="daysGroup"
      v-model="form.model.days"
      name="days"
      class="fb-triggers-select-time__days"
    >
      <div
        v-for="(day, key) of days"
        :key="key"
        class="fb-triggers-select-time__day"
      >
        <fb-form-checkbox
          :id="`day_${key}`"
          :value="key + 1"
          :group="daysGroup"
          name="days"
        >
          {{ $t(`application.days.${day}.short`) }}
        </fb-form-checkbox>
      </div>
    </fb-form-checkboxes-group>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api'

import 'vue-scroll-picker/dist/style.css'

import get from 'lodash/get'

import { FbFormCheckboxesGroup } from '@fastybird/web-ui-theme'

interface TriggersSelectTimeFormInterface {
  model: {
    hour: number
    minute: number
    ampm: string
    days: Array<number>
  }
}

interface TriggersSelectTimeValueInterface {
  selected: boolean
  time: string
  days: Array<number>
}

interface TriggersSelectTimePropsInterface {
  value: TriggersSelectTimeValueInterface
}

export default defineComponent({

  name: 'TriggersSelectTime',

  props: {

    value: {
      type: Object as PropType<TriggersSelectTimeValueInterface>,
      default: null,
    },

  },

  setup(props: TriggersSelectTimePropsInterface, context: SetupContext) {
    const isMounted = ref<boolean>(false)
    const daysGroup = ref<InstanceType<typeof FbFormCheckboxesGroup> | null>(null)

    const show24hours = computed<boolean>((): boolean => {
      return get(context.root.$store.getters['session/getAccount'](), 'timeFormat', 'HH:mm') === 'HH:mm'
    })

    const form = reactive<TriggersSelectTimeFormInterface>({
      model: {
        hour: parseInt(context.root.$dateFns.format(new Date(props.value.time), show24hours.value ? 'H' : 'h'), 10),
        minute: parseInt(context.root.$dateFns.format(new Date(props.value.time), 'm'), 10),
        ampm: context.root.$dateFns.format(new Date(props.value.time), 'aaaaa'),
        days: props.value.days,
      },
    })

    const hours = []

    if (show24hours.value) {
      for (let i = 0; i <= 23; i++) {
        hours.push({ value: i, name: (`00${i}`).substr(-2) })
      }
    } else {
      for (let i = 1; i <= 12; i++) {
        hours.push({ value: i, name: (`00${i}`).substr(-2) })
      }
    }

    const minutes = []

    for (let i = 0; i <= 59; i++) {
      minutes.push({ value: i, name: (`00${i}`).substr(-2) })
    }

    const days = [
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat',
      'sun',
    ]

    const ampm = [
      { value: 'a', name: 'a.m.' },
      { value: 'p', name: 'p.m.' },
    ]

    function emitUpdate(): void {
      const today = new Date()

      let date

      if (show24hours.value) {
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), form.model.hour, form.model.minute, 0)
      } else {
        date = new Date(`${(`00${today.getMonth() + 1}`).substr(-2)}/${today.getDate()}/${today.getFullYear()} ${(`00${form.model.hour}`).substr(-2)}:${(`00${form.model.minute}`).substr(-2)}:00 ${form.model.ampm === 'a' ? 'am' : 'pm'}`)
      }

      context.emit('input', Object.assign(props.value, {
        selected: props.value.selected,
        time: date.toISOString(),
        days: form.model.days,
      }))
    }

    onMounted((): void => {
      isMounted.value = true
    })

    watch(
      () => form.model.days,
      (): void => {
        if (isMounted.value) {
          emitUpdate()
        }
      },
    )

    watch(
      () => form.model.hour,
      (): void => {
        if (isMounted.value) {
          emitUpdate()
        }
      },
    )

    watch(
      () => form.model.minute,
      (): void => {
        if (isMounted.value) {
          emitUpdate()
        }
      },
    )

    watch(
      () => form.model.ampm,
      (): void => {
        if (isMounted.value) {
          emitUpdate()
        }
      },
    )

    return {
      show24hours,
      form,
      hours,
      minutes,
      days,
      ampm,
      daysGroup,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
