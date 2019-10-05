<template>
  <div class="fb-error-layout__container">
    <div class="fb-error-layout__body">
      <h1>{{ message }}</h1>

      <h4>We are sorry, the page you requested cannot be found.</h4>

      <p>
        <small>
          The URL may be misspelled or the page you're looking for is no longer available. If you think you have arrived
          here by our mistake, please <a href="#">contact us</a>.
        </small>
      </p>

      <p>
        <fb-button
          :to="{ path: '/' }"
          pill
          variant="primary"
        >
          Return to homepage
        </fb-button>
      </p>
    </div>

    <div class="fb-error-layout__footer">
      <ul class="list-inline">
        <li>
          <a
            class="link-muted"
            href="https://twitter.com/FastyBird"
            target="_blank"
            rel="noreferrer"
          >
            <font-awesome-icon
              :icon="['fab', 'twitter']"
              class="icon icon-2x"
            />
          </a>
        </li>
        <li>
          <a
            class="link-muted"
            href="https://www.facebook.com/FastyBird"
            target="_blank"
            rel="noreferrer"
          >
            <font-awesome-icon
              :icon="['fab', 'facebook']"
              class="icon icon-2x"
            />
          </a>
        </li>
        <li>
          <a
            class="link-muted"
            href="https://github.com/fastybird"
            target="_blank"
            rel="noreferrer"
          >
            <font-awesome-icon
              :icon="['fab', 'github']"
              class="icon icon-2x"
            />
          </a>
        </li>
      </ul>
      <p>
        <small>&copy; 2017 <a
          v-if="_.get(this, '$authorWebsite', null) !== null"
          :href="_.get(this, '$authorWebsite', null)"
          target="_blank"
          rel="noreferrer"
        >{{ _.get(this, '$authorName', null) }}</a></small>
      </p>
    </div>
  </div>
</template>

<script>
  export default {

    name: 'LayoutError',

    props: {

      error: {
        type: Object,
        default: null,
      },

    },

    layout: 'blank',

    computed: {

      statusCode() {
        return (this.error && this.error.statusCode) || 500
      },

      message() {
        return this.error.message || '<%= messages.client_error %>'
      },

    },

    head() {
      return {
        htmlAttrs: {
          'data-layout': 'layout_error',
        },
      }
    },

  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import '~@fastybird-com/theme/assets/layout/error';
</style>
