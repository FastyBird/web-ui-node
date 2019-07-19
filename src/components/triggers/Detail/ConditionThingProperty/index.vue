<template web>
  <div
    v-if="thing && property"
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
    {{ thing.label }}
    <small class="d-b">
      {{ property.name }}:
      {{ condition.operator }}
      {{ condition.operands }}
    </small>
  </div>
  <div
    v-else
    class="p-y-lg"
  >
    <span class="spinner spinner-primary spinner-sm" />
  </div>
</template>

<script>
  import Thing from '@/store/modules/io-server/Thing'
  import ThingProperty from '@/store/modules/io-server/ThingProperty'

  export default {

    name: 'TriggersDetailConditionThingProperty',

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
        return Thing.find(this.condition.thing_id)
      },

      /**
       * Condition thing property
       *
       * @returns {(ThingProperty|null)}
       */
      property() {
        return ThingProperty.find(this.condition.property_id)
      },

    },

    methods: {

      remove() {
        this.$emit('remove', this.condition)
      },

    },

  }
</script>
