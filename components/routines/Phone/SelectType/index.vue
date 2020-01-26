<template>
  <div>
    <fb-button
      block
      variant="link"
      name="condition"
      @click.prevent="create(types.scheduled)"
    >
      {{ $t('routines.buttons.addTypeTimeOfDay.title') }}
    </fb-button>

    <fb-divider
      text="OR"
      type="horizontal"
    />

    <fb-button
      block
      variant="link"
      name="action"
      @click.prevent="create(types.thing)"
    >
      {{ $t('routines.buttons.addTypeThingControlled.title') }}
    </fb-button>

    <fb-divider
      text="OR"
      type="horizontal"
    />

    <fb-button
      block
      variant="link"
      name="action"
      @click.prevent="create(types.sensor)"
    >
      {{ $t('routines.buttons.addTypeSensorDetect.title') }}
    </fb-button>

    <fb-divider
      text="OR"
      type="horizontal"
    />

    <fb-button
      block
      variant="link"
      name="action"
      @click.prevent="create(types.manual)"
    >
      {{ $t('routines.buttons.addTypeManual.title') }}
    </fb-button>
  </div>
</template>

<script>
import {
  ROUTINES_QUERY_TYPE_SCHEDULED,
  ROUTINES_QUERY_TYPE_THING,
  ROUTINES_QUERY_TYPE_SENSOR,
  ROUTINES_QUERY_TYPE_MANUAL,
} from '@/configuration/routes'

export default {

  name: 'RoutinesPhoneSelectTpe',

  data() {
    return {
      types: {
        scheduled: ROUTINES_QUERY_TYPE_SCHEDULED,
        thing: ROUTINES_QUERY_TYPE_THING,
        sensor: ROUTINES_QUERY_TYPE_SENSOR,
        manual: ROUTINES_QUERY_TYPE_MANUAL,
      },
    }
  },

  methods: {

    create(type) {
      this.$router.push(this.localePath({
        name: this.$routes.routines.create,
        query: {
          type,
        },
      }))
    },

  },

}
</script>
