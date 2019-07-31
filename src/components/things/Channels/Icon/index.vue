<template functional>
  <div class="circle text-center">
    <device-icon :name="props.icon" />
  </div>
</template>

<script>
  export default {

    name: 'ThingsChannelsIcon',

    props: {

      icon: {
        type: String,
        required: true,
      },

    },

  }
</script>
