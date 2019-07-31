<template>
  <div
    v-if="thing && channel && property"
    class="list-group-item"
  >
    <span
      v-if="removingEnabled"
      class="pull-right"
      role="button"
      @click.prevent="remove()"
    >
      <font-awesome-icon icon="trash" />
    </span>
    {{ thing.label }} | {{ channel.label }}
    <template v-if="isSwitch">
      <small class="d-b">
        {{ property.name }}:
        {{ condition.operator }}
        {{ condition.operands }}
      </small>
    </template>
    <template v-if="isButton">
      <small class="d-b">
        {{ property.name }}:
        {{ condition.operator }}
        {{ condition.operands }}
      </small>
    </template>
    <template v-if="isAnalogSensor">
      <small
        v-if="isAbove"
        class="d-b"
      >
        {{ $t('texts.valueAbove', {value: `${value} ${units}`}) }}
      </small>
      <small
        v-else-if="isBelow"
        class="d-b"
      >
        {{ $t('texts.valueBelow', {value: `${value} ${units}`}) }}
      </small>
    </template>
  </div>
  <div
    v-else
    class="p-y-lg"
  >
    <span class="spinner spinner-primary spinner-sm" />
  </div>
</template>

<script>
  import number from '@/helpers/number'

  import Channel from '@/store/modules/io-server/Channel'
  import ChannelProperty from '@/store/modules/io-server/ChannelProperty'
  import Thing from '@/store/modules/io-server/Thing'

  import {
    CHANNEL_TYPE_ANALOG_SENSOR,
    CHANNEL_TYPE_SWITCH,
    CHANNEL_TYPE_BUTTON,
  } from '@/constants'

  export default {

    name: 'TriggersDetailConditionChannelProperty',

    props: {

      condition: {
        type: Object,
        required: true,
      },

      removingEnabled: {
        type: Boolean,
        required: false,
        default: true,
      },

    },

    computed: {

      /**
       * Condition thing
       *
       * @returns {(Thing|null)}
       */
      thing() {
        return this.channel !== null ? Thing.find(this.channel.thing_id) : null
      },

      /**
       * Condition channel
       *
       * @returns {(Channel|null)}
       */
      channel() {
        return Channel
          .query()
          .with('properties')
          .where('id', this.condition.channel_id)
          .first()
      },

      /**
       * Condition channel property
       *
       * @returns {(ChannelProperty|null)}
       */
      property() {
        return ChannelProperty.find(this.condition.property_id)
      },

      /**
       * Check if chanel is switch type
       *
       * @returns {Boolean}
       */
      isSwitch() {
        return this.channel.structure_type === CHANNEL_TYPE_SWITCH
      },

      /**
       * Check if chanel is button type
       *
       * @returns {Boolean}
       */
      isButton() {
        return this.channel.structure_type === CHANNEL_TYPE_BUTTON
      },

      /**
       * Check if chanel is analog sensor type
       *
       * @returns {Boolean}
       */
      isAnalogSensor() {
        return this.channel.structure_type === CHANNEL_TYPE_ANALOG_SENSOR
      },

      /**
       * For analog sensor channel check above action condition
       *
       * @returns {Boolean}
       */
      isAbove() {
        return this.isAnalogSensor && this.condition.operator === 'above'
      },

      /**
       * For analog sensor channel check below action condition
       *
       * @returns {Boolean}
       */
      isBelow() {
        return this.isAnalogSensor && this.condition.operator === 'below'
      },

      /**
       * Channel current values
       *
       * @returns {(String|null)}
       */
      value() {
        if (!this.isAnalogSensor) {
          return null
        }

        return number.format(this.condition.value, 2, ',', ' ')
      },

      /**
       * Channel units
       *
       * @returns {(String|null)}
       */
      units() {
        if (!this.isAnalogSensor) {
          return null
        }

        return this.$t(`application.units.short.${this.property.data_type}.${this.property.units}`)
      },

    },

    methods: {

      remove() {
        this.$emit('remove', this.condition)
      },

    },

  }
</script>

<i18n src="./locales.json" />
