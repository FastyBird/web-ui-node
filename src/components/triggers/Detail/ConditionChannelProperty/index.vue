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
    {{ thing.label }} | {{ $tChannel(thing, channel) }}
    <template v-if="isSwitch">
      <small class="d-b">
        {{ $tChannelProperty(thing, channel, property) }}:
        {{ condition.operator }}
        {{ condition.operands }}
      </small>
    </template>
    <template v-if="isButton">
      <small class="d-b">
        {{ $tChannelProperty(thing, channel, property) }}:
        {{ condition.operator }}
        {{ condition.operands }}
      </small>
    </template>
    <template v-if="isSensor">
      <small class="d-b">
        {{ $tChannelProperty(thing, channel, property) }}:
        <template v-if="condition.operator === 'above'">
          {{ $t('texts.valueAbove', {value: `${value} ${units}`}) }}
        </template>
        <template v-else-if="condition.operator === 'below'">
          {{ $t('texts.valueBelow', {value: `${value} ${units}`}) }}
        </template>
        <template v-else>
          {{ $t('texts.valueEqual', {value: `${value} ${units}`}) }}
        </template>
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

  import Channel from '@/plugins/io-server/store/modules/io-server/Channel'
  import ChannelProperty from '@/plugins/io-server/store/modules/io-server/ChannelProperty'
  import Thing from '@/plugins/io-server/store/modules/io-server/Thing'

  import {
    DATA_TYPE_INTEGER,
    DATA_TYPE_FLOAT,

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
      isSensor() {
        return this.property.data_type === DATA_TYPE_FLOAT || this.property.data_type === DATA_TYPE_INTEGER
      },

      /**
       * Channel current values
       *
       * @returns {(String|null)}
       */
      value() {
        return number.format(this.condition.operands[0], 2, ',', ' ')
      },

      /**
       * Channel units
       *
       * @returns {(String|null)}
       */
      units() {
        return this._.get(this.property, 'units', null)
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
