<template functional>
  <div class="p-x-md">
    <div class="row">
      <div class="col-8 offset-2 col-sm-6 offset-sm-3 col-md-4 offset-md-4 col-xl-2 offset-xl-5 p-t-lg">
        <div class="text-center p-a-lg">
          <span class="icon-with-child">
            <font-awesome-icon
              :icon="props.icon"
              class="icon-5x text-muted m-y-lg"
            />
            <span
              class="bg-primary circle sq-32 icon-2x icon-child m-y-lg"
              style="padding-top: 1px;"
            >
              <font-awesome-icon :icon="props.secondIcon" />
            </span>
          </span>
        </div>

        <p class="text-center m-b-lg">
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
