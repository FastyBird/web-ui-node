<template>
  <div class="fb-iot-groups-detail__container">
    <no-results
      :message="$t('groups.texts.noThings')"
      icon="plug"
    />
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

      this.group.channels_ids.forEach((item) => {
        if (this.$store.getters['entities/thing/getting'](item.id)) {
          return true
        }
      })

      return false
    },

  },

}
</script>
