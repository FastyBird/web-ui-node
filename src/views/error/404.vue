<template web>
  <layout name="LayoutError">
    <div>
      <h1>Page Not Found</h1>

      <h4>We are sorry, the page you requested cannot be found.</h4>

      <p>
        <small>
          The URL may be misspelled or the page you're looking for is no longer available. If you think you have arrived here by our mistake, please <a href="#">contact us</a>.
        </small>
      </p>

      <p>
        <fb-button
          :to="{ name: 'Home' }"
          pill
          thick=""
          variant="primary"
          href="index.html"
        >
          Return to homepage
        </fb-button>
      </p>
    </div>
  </layout>
</template>

<script>
  export default {

    name: 'Error404View',

  }
</script>
