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
    <template v-if="channel.isSwitch">
      <small class="d-b">
        {{ $tChannelProperty(thing, channel, property) }}:
        {{ condition.operator }}
        {{ condition.operands }}
      </small>
    </template>
    <template v-if="channel.isButton">
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
        return this.channel !== null ? this.$store.getters['entities/thing/find'](this.channel.thing_id) : null
      },

      /**
       * Condition channel
       *
       * @returns {(Channel|null)}
       */
      channel() {
        return this.$store.getters['entities/channel/query']()
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
        return this.$store.getters['entities/channel_property/find'](this.condition.property_id)
      },

      /**
       * Check if chanel is analog sensor type
       *
       * @returns {Boolean}
       */
      isSensor() {
        return this._.get(this.property, 'isNumber', false)
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
        return this._.get(this.property, 'units', null) !== null ? this._.get(this.property, 'units', null) : ''
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
