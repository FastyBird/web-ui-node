<template>
  <div class="fb-groups-detail__container">
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

}
</script>
