<template>
  <list-item v-if="fetchingThings || fetchingThing || !thing">
    <template slot="icon">
      <fb-spinner size="sm" />
    </template>

    <template slot="heading">
      {{ $t('routines.texts.loadingThing') }}
    </template>

    <template slot="detail">
      &nbsp;
    </template>
  </list-item>

  <list-item
    v-else-if="thing"
    :show-status="true"
    :status="condition.enabled"
  >
    <template slot="icon">
      <font-awesome-icon :icon="$thingIcon(thing)" />
    </template>

    <template slot="heading">
      {{ $tThing(thing) }}
    </template>

    <template slot="sub-heading">
      <span
        v-for="(row, index) in properties"
        :key="index"
        class="fb-routines-condition__condition"
      >{{ $t(`routines.conditions.${row.operator}`, { property: $tChannelProperty(thing, row.property), value: row.operand }) }}</span>
    </template>

    <template slot="detail-large">
      <fb-form-checkbox
        v-model="enabled"
        name="enabled"
      />

      <fb-button
        size="sm"
        variant="link"
        @click="remove"
      >
        {{ $t('application.buttons.remove.title') }}
      </fb-button>
    </template>
  </list-item>
</template>

<script>
export default {

  name: 'RoutinesDetailListCondition',

  props: {

    condition: {
      type: Object,
      required: true,
      validator: (value) => {
        return !(
          !Object.prototype.hasOwnProperty.call(value, 'thing') ||
          !Object.prototype.hasOwnProperty.call(value, 'enabled') ||
          !Object.prototype.hasOwnProperty.call(value, 'rows') ||
          !Array.isArray(value.rows) ||
          !value.rows.length
        )
      },
    },

  },

  data() {
    return {
      enabled: true,
    }
  },

  computed: {

    /**
     * Condition thing
     *
     * @returns {Thing}
     */
    thing() {
      return this.$store.getters['entities/thing/query']()
        .with('device')
        .with('channel')
        .with('channel.properties')
        .where('id', this.condition.thing)
        .first()
    },

    /**
     * Mapped properties with values
     *
     * @returns {Array}
     */
    properties() {
      const mapped = []

      this.condition.rows
        .forEach((row) => {
          mapped.push({
            operand: row.operand,
            operator: row.operator,
            property: this.$store.getters['entities/channel_property/find'](row.property_id),
          })
        })

      return mapped
    },

    /**
     * Flag signalizing that things are loading from server
     *
     * @returns {Boolean}
     */
    fetchingThings() {
      return this.$store.getters['entities/thing/fetching']()
    },

    /**
     * Flag signalizing that thing is loading from server
     *
     * @returns {Boolean}
     */
    fetchingThing() {
      return this.$store.getters['entities/thing/getting'](this.condition.thing)
    },

  },

  watch: {

    enabled() {
      this.$emit('toggle')
    },

  },

  created() {
    this.enabled = this.condition.enabled
  },

  methods: {

    remove() {
      this.$emit('remove')
    },

  },

}
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
