<template>
  <div class="fb-iot-groups-detail__container">
    <div class="text-center p-a-lg">
      <span class="icon-with-child">
        <font-awesome-icon
          icon="plug"
          class="icon-5x text-muted m-y-lg"
        />
        <span
          class="bg-primary circle sq-32 icon-2x icon-child m-y-lg"
          style="padding-top: 1px;"
        >
          <font-awesome-icon icon="plug" />
        </span>
      </span>
    </div>

    <p class="text-center m-t-md m-b-lg">
      {{ $t('groups.texts.noThings') }}
    </p>
  </div>
</template>

<script>
  export default {

    name: 'GroupsDetail',

    props: {

      group: {
        type: Object,
        required: true,
      },

      things: {
        type: Array,
        required: true,
      },

    },

    computed: {

      /**
       * Flag signalizing that group channels are loading from server
       *
       * @returns {Boolean}
       */
      fetchingThings() {
        if (this.$store.getters['entities/thing/fetching']()) {
          return true
        }

        this.group.channels_ids.forEach(item => {
          if (this.$store.getters['entities/thing/getting'](item.id)) {
            return true
          }
        })

        return false
      },

    },

  }
</script>
