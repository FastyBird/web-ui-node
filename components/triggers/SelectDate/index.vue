<template>
  <div class="fb-triggers-select-date__container">
    <h3>{{ $t('triggers.fields.conditionDate.title') }}</h3>

    <scroll-picker-group>
      <scroll-picker
        v-model="form.model.day"
        :options="days"
      />
      <scroll-picker
        v-model="form.model.month"
        :options="months"
      />
      <scroll-picker
        v-model="form.model.year"
        :options="years"
      />
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

interface TriggersSelectDateFormInterface {
  model: {
    day: number
    month: number
    year: number
    hour: number
    minute: number
    ampm: string
  }
}

interface TriggersSelectDateValueInterface {
  selected: boolean
  date: string
}

interface TriggersSelectDatePropsInterface {
  value: TriggersSelectDateValueInterface
}

export default defineComponent({

  name: 'TriggersSelectDate',

  props: {

    value: {
      type: Object as PropType<TriggersSelectDateValueInterface>,
      default: null,
    },

  },

  setup(props: TriggersSelectDatePropsInterface, context: SetupContext) {
    const isMounted = ref<boolean>(false)

    const show24hours = computed<boolean>((): boolean => {
      return get(context.root.$store.getters['session/getAccount'](), 'timeFormat', 'HH:mm') === 'HH:mm'
    })

    const form = reactive<TriggersSelectDateFormInterface>({
      model: {
        day: parseInt(context.root.$dateFns.format(new Date(props.value.date), 'd'), 10),
        month: parseInt(context.root.$dateFns.format(new Date(props.value.date), 'M'), 10),
        year: parseInt(context.root.$dateFns.format(new Date(props.value.date), 'yyyy'), 10),
        hour: parseInt(context.root.$dateFns.format(new Date(props.value.date), show24hours.value ? 'H' : 'h'), 10),
        minute: parseInt(context.root.$dateFns.format(new Date(props.value.date), 'm'), 10),
        ampm: context.root.$dateFns.format(new Date(props.value.date), 'aaaaa'),
      },
    })

    const days = []

    for (let i = 1; i <= 31; i++) {
      days.push({ value: i, name: (`00${i}`).substr(-2) })
    }

    const months = []

    for (let i = 1; i <= 12; i++) {
      months.push({ value: i, name: (`00${i}`).substr(-2) })
    }

    const years = []

    for (let i = 2020; i <= 2050; i++) {
      years.push({ value: i, name: (`0000${i}`).substr(-4) })
    }

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

    const ampm = [
      { value: 'a', name: 'a.m.' },
      { value: 'p', name: 'p.m.' },
    ]

    function emitUpdate(): void {
      let date

      if (show24hours.value) {
        date = new Date(form.model.year, (form.model.month - 1), form.model.day, form.model.hour, form.model.minute, 0)
      } else {
        date = new Date(`${form.model.month}/${form.model.day}/${form.model.year} ${(`00${form.model.hour}`).substr(-2)}:${(`00${form.model.minute}`).substr(-2)}:00 ${form.model.ampm === 'a' ? 'am' : 'pm'}`)
      }

      context.emit('input', Object.assign(props.value, {
        selected: props.value.selected,
        date: date.toISOString(),
      }))
    }

    onMounted((): void => {
      isMounted.value = true
    })

    watch(
      () => form.model.day,
      (): void => {
        if (isMounted.value) {
          emitUpdate()
        }
      },
    )

    watch(
      () => form.model.month,
      (): void => {
        if (isMounted.value) {
          emitUpdate()
        }
      },
    )

    watch(
      () => form.model.year,
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
      ampm,
      days,
      months,
      years,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
