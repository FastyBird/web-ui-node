<template>
  <default-thing :thing="thing" />
</template>

<script>
import DefaultThing from '~/components/things/Detail/Default'

export default {

  name: 'ThingsDesktopDetailDefault',

  components: {
    DefaultThing,
  },

  props: {

    thing: {
      type: Object,
      required: true,
    },

  },

}
</script>
