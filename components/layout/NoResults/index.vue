<template functional>
  <div class="fb-no-results__container">
    <div>
      <div>
        <icon-with-child
          :primary-icon="props.icon"
          :child-icon="props.secondIcon"
        />

        <p>
          {{ props.message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {

    name: 'NoResults',

    props: {

      icon: {
        type: String,
        required: true,
      },

      secondIcon: {
        type: String,
        default: 'plus',
      },

      message: {
        type: String,
        required: true,
      },

    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import 'index';
</style>
