<template>
  <list-item v-if="fetchingThings || fetchingThing || !thing">
    <template slot="icon">
      <fb-spinner size="sm" />
    </template>

    <template slot="heading">
      {{ $t('things.texts.loadingThing') }}
    </template>

    <template slot="detail">
      &nbsp;
    </template>
  </list-item>

  <list-item
    v-else-if="thing"
    :show-status="true"
    :status="enabled"
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
        class="fb-things-trigger-action__action"
      >{{ $t(`things.vendors.${hardware.manufacturer}.actions.${row.operation}`, { property: $tChannelProperty(thing, row.property).toLowerCase() }) }}</span>
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

    name: 'ButtonThingTriggerAction',

    props: {

      action: {
        type: Object,
        required: true,
        validator: (value) => {
          return !(
            !value.hasOwnProperty('thing') ||
            !value.hasOwnProperty('enabled') ||
            !value.hasOwnProperty('rows') ||
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
       * Action thing
       *
       * @returns {Thing}
       */
      thing() {
        return this.$store.getters['entities/thing/query']()
          .with('device')
          .with('channel')
          .with('channel.properties')
          .where('id', this.action.thing)
          .first()
      },

      /**
       * Get thing hardware info
       *
       * @returns {Hardware}
       */
      hardware() {
        return this.$store.getters['entities/hardware/query']()
          .where('device_id', this.thing.device_id)
          .first()
      },

      /**
       * Mapped properties with values
       *
       * @returns {Array}
       */
      properties() {
        const mapped = []

        this.action.rows
          .forEach(row => {
            mapped.push({
              operation: row.operation,
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
        return this.$store.getters['entities/thing/getting'](this.action.thing)
      },

    },

    watch: {

      enabled() {
        this.$emit('toggle')
      },

    },

    created() {
      this.enabled = this.action.enabled
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
