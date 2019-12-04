<template>
  <list-item class="fb-routines-action__container">
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
        class="fb-routines-action__action"
      >{{ $t(`routines.actions.${row.operation}`, { property: $tChannelProperty(thing, row.property).toLowerCase() }) }}</span>
    </template>

    <template slot="detail-large">
      <switch-element
        :status="enabled"
        @change="toggleThing"
      />

      <fb-button
        size="sm"
        variant="link"
        @click="editThing"
      >
        {{ $t('application.buttons.edit.title') }}
      </fb-button>
    </template>
  </list-item>
</template>

<script>
  export default {

    name: 'RoutinesEditListAction',

    props: {

      action: {
        type: Object,
        required: true,
        validator: (value) => {
          return !(
            !value.hasOwnProperty('enabled') ||
            !value.hasOwnProperty('thing') ||
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
              property: this.$store.getters['entities/channel_property/find'](row.property),
            })
          })

        return mapped
      },

    },

    methods: {

      toggleThing() {
        this.$emit('toggle')
      },

      editThing() {
        this.$emit('edit')
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
