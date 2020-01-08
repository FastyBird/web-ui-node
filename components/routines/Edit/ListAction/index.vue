<template>
  <list-item
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
      >{{ $t(`routines.actions.${row.operation}`, { property: $tChannelProperty(thing, row.property).toLowerCase() }) }}</span>
    </template>

    <template slot="detail-large">
      <fb-form-checkbox
        v-model="enabled"
        name="enabled"
      />

      <fb-button
        size="sm"
        variant="link"
        @click="edit"
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
              property: this.$store.getters['entities/channel_property/find'](row.property_id),
            })
          })

        return mapped
      },

    },

    watch: {

      enabled() {
        this.$emit('toggle')
      },

    },

    methods: {

      edit() {
        this.$emit('edit')
      },

    },

  }
</script>
