<template>
  <button-thing
    v-if="isButtonThing"
    :thing="thing"
  />
  <default-thing
    v-else
    :thing="thing"
  />
</template>

<script>
import DefaultThing from './Things/Default'
import ButtonThing from './Things/Button'

export default {

  name: 'ThingsDetail',

  components: {
    DefaultThing,
    ButtonThing,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

  computed: {

    /**
     * Get thing hardware info
     *
     * @returns {(Hardware|null)}
     */
    hardware() {
      return this.$store.getters['entities/hardware/query']()
        .where('device_id', this.thing.device_id)
        .first()
    },

    /**
     * Check if thing is button type
     *
     * @returns {Boolean}
     */
    isButtonThing() {
      return !!(this._.get(this.hardware, 'isManufacturerFastyBird', false) &&
        (
          this._.get(this.hardware, 'model') === '8ch_buttons' || this._.get(this.hardware, 'model') === '16ch_buttons'
        ))
    },

  },

}
</script>
