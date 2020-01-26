<template>
  <list-item
    :show-status="true"
    :status="thing.state"
    class="fb-iot-things-list-item__container"
    @click="oneClick"
  >
    <template slot="icon">
      <icon-with-child :primary-icon="$thingIcon(thing)" />
    </template>

    <template slot="heading">
      {{ $tThing(thing) }}
    </template>

    <template slot="sub-heading">
      {{ $tThingDevice(thing) }}
    </template>

    <template
      v-if="switchProperty || environmentProperty"
      slot="detail"
    >
      <switch-actor
        v-if="switchProperty"
        :thing="thing"
        :property="switchProperty"
      />

      <div v-else-if="environmentProperty">
        <template v-if="thing.state">
          <span class="fb-iot-things-list-item__value">{{ environmentPropertyValue }}</span>
          <span class="fb-iot-things-list-item__unit">{{ _.get(environmentProperty, 'unit', null) }}</span>
        </template>
        <template v-else>
          <span class="fb-iot-things-list-item__value">{{ $t('application.states.notAvailable') }}</span>
        </template>
      </div>
    </template>
  </list-item>
</template>

<script>
import number from '@/helpers/number'

import SwitchActor from '@/components/things/Actors/Switch'

export default {

  name: 'ThingsListItem',

  components: {
    SwitchActor,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

    exchangeStatus: {
      type: Boolean,
      default: false,
    },

  },

  data() {
    return {
      switchProperty: null,
      environmentProperty: null,
    }
  },

  computed: {

    environmentPropertyValue() {
      const propertyValue = this.$store.getters['entities/channel_property_value/query']()
        .where('channel_id', this._.get(this.thing, 'channel.id', null))
        .where('property_id', this._.get(this.environmentProperty, 'id', null))
        .first()

      return propertyValue !== null ? number.format(parseFloat(propertyValue.value), 2, ',', ' ') : '-'
    },

  },

  watch: {

    exchangeStatus() {
      this._subscribeSockets()
    },

  },

  created() {
    const hardware = this.$store.getters['entities/hardware/query']()
      .where('device_id', this.thing.device_id)
      .first()

    const switchProperty = this._.first(this._.filter(this._.get(this.thing, 'channel.properties', []), 'isSwitch'))

    this.switchProperty = typeof switchProperty !== 'undefined' ? switchProperty : null

    if (this._.get(hardware, 'isManufacturerItead') && this._.get(hardware, 'model') === 'sonoff_sc') {
      const envProperty = this._.filter(this._.get(this.thing, 'channel.properties', []), 'isEnvironment')
        .find(({ property }) => property === 'temperature')

      this.environmentProperty = typeof envProperty !== 'undefined' ? envProperty : null
    }
  },

  beforeMount() {
    this._subscribeSockets()
  },

  methods: {

    /**
     * Double click and single click event handler
     *
     * @param {Object} event
     */
    oneClick(event) {
      this.$emit('click', event, this.thing)
    },

    /**
     * If it is possible and necessary, connect thing to sockets
     *
     * @private
     */
    _subscribeSockets() {
      if (this.exchangeStatus) {
        this.$store.dispatch('entities/device_socket/subscribe', {
          device_id: this.thing.device_id,
        }, {
          root: true,
        })
      }
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
