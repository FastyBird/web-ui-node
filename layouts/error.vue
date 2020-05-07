<template>
  <fb-error-layout
    :error="error"
    :message="message"
    :description="description"
    :status-code="statusCode"
    :home-link="localePath({ name: $routes.home })"
    :author-website="author.website"
    :author-name="author.name"
  >
    <p slot="info">
      <small>
        The URL may be misspelled or the page you're looking for is no longer available. If you think you have arrived
        here by our mistake, please <a href="#">contact us</a>.
      </small>
    </p>
  </fb-error-layout>
</template>

<script>
import * as config from '~/configuration'

const FbErrorLayout = () => import('@/node_modules/@fastybird-com/ui-theme/layouts/error')

export default {

  name: 'LayoutError',

  components: {
    FbErrorLayout,
  },

  props: {

    error: {
      type: Object,
      default: null,
    },

  },

  data() {
    return {
      author: {
        name: config.AUTHOR_NAME,
        website: config.AUTHOR_WEBSITE,
      },
    }
  },

  layout: 'blank',

  computed: {

    statusCode() {
      return (this.error && parseInt(this.error.statusCode, 10)) || 500
    },

    message() {
      return this.error.message || '<%= messages.client_error %>'
    },

    description() {
      switch (this.statusCode) {
        case 404:
          return 'We are sorry, the page you requested cannot be found.'

        case 503:
          return 'Please try reload page.'
      }

      return this.error.message || '<%= messages.client_error %>'
    },

  },

}
</script>
