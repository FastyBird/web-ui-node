<template>
  <div class="fb-modal-window__content fb-routines-select-type__container">
    <div class="fb-modal-window__header">
      <button
        type="button"
        class="fb-modal-window__close"
        @click.prevent="$emit('close')"
      >
        <span aria-hidden="true">×</span>
        <span class="sr-only">{{ $t('application.buttons.close.title') }}</span>
      </button>

      <div>
        <font-awesome-icon icon="clock" />

        <h4>
          Routine type
        </h4>

        <small>Facilis blanditiis, quibusdam corporis porro natus neque soluta nihil hic aliquam, suscipit, consectetur omnis placeat architecto quae laboriosam. Id porro adipisci, alias.</small>
      </div>
    </div>

    <div class="fb-modal-window__body">
      <div>
        <fb-button
          block
          variant="outline-primary"
          name="scheduled"
          size="lg"
          @click.prevent="create(types.scheduled)"
        >
          {{ $t('routines.buttons.addTypeTimeOfDay.title') }}
        </fb-button>
      </div>
      <div>
        <fb-button
          block
          variant="outline-primary"
          name="thing"
          size="lg"
          @click.prevent="create(types.thing)"
        >
          {{ $t('routines.buttons.addTypeThingControlled.title') }}
        </fb-button>
      </div>
      <div>
        <fb-button
          block
          variant="outline-primary"
          name="sensor"
          size="lg"
          @click.prevent="create(types.sensor)"
        >
          {{ $t('routines.buttons.addTypeSensorDetect.title') }}
        </fb-button>
      </div>
      <div>
        <fb-button
          block
          variant="outline-primary"
          name="scene"
          size="lg"
          @click.prevent="create(types.manual)"
        >
          {{ $t('routines.buttons.addTypeManual.title') }}
        </fb-button>
      </div>
    </div>

    <div class="fb-modal-window__footer">
      <fb-button
        uppercase
        variant="link"
        size="lg"
        name="close"
        @click.prevent="$emit('close')"
      >
        {{ $t('application.buttons.close.title') }}
      </fb-button>
    </div>
  </div>
</template>

<script>
import {
  ROUTINES_HASH_CREATE,

  ROUTINES_QUERY_TYPE_SCHEDULED,
  ROUTINES_QUERY_TYPE_THING,
  ROUTINES_QUERY_TYPE_SENSOR,
  ROUTINES_QUERY_TYPE_MANUAL,
} from '@/configuration/routes'

export default {

  name: 'RoutinesDesktopSelectTpe',

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
        name: this.$routes.routines.list,
        hash: `${ROUTINES_HASH_CREATE}-${type}`,
      }))
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
