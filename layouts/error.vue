<template>
  <div class="fb-error__container">
    <div class="fb-error__container-inner">
      <div class="fb-error__box">
        <h1>{{ message }}</h1>

        <h4>{{ description }}</h4>

        <p>
          <small>
            The URL may be misspelled or the page you're looking for is no longer available. If you think you have
            arrived
            here by our mistake, please <a href="#">contact us</a>.
          </small>
        </p>

        <p>
          <fb-ui-button
            :to="localePath({ name: $routes.home })"
            pill
            variant="primary"
          >
            Return to homepage
          </fb-ui-button>
        </p>
      </div>

      <div class="fb-error__footer">
        <ul>
          <li>
            <a
              href="https://twitter.com/FastyBird"
              target="_blank"
              rel="noreferrer"
            >
              <font-awesome-icon :icon="['fab', 'twitter']" />
            </a>
          </li>
          <li>
            <a
              href="https://www.facebook.com/FastyBird"
              target="_blank"
              rel="noreferrer"
            >
              <font-awesome-icon :icon="['fab', 'facebook']" />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/fastybird"
              target="_blank"
              rel="noreferrer"
            >
              <font-awesome-icon :icon="['fab', 'github']" />
            </a>
          </li>
        </ul>
        <p>
          <small>&copy; 2017 <a
            :href="application.website"
            target="_blank"
            rel="noreferrer"
          >{{ application.author }}</a></small>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
} from '@vue/composition-api'

import { NuxtError } from '@nuxt/types'

import { version } from './../package.json'

import * as config from '~/configuration'

interface LayoutErrorPropsInterface {
  error: NuxtError
}

interface LayoutErrorApplicationInterface {
  author: string
  website: string
  version: string
}

export default defineComponent({

  name: 'LayoutError',

  layout: 'blank',

  props: {

    error: {
      type: Object as PropType<NuxtError>,
      default: null,
    },

  },

  setup(props: LayoutErrorPropsInterface) {
    const application = reactive<LayoutErrorApplicationInterface>({
      author: config.AUTHOR_NAME,
      website: config.AUTHOR_WEBSITE,
      version,
    })

    const statusCode = (props.error && props.error.statusCode && props.error.statusCode) || 500

    const message = props.error.message || '<%= messages.client_error %>'

    let description = ''

    switch (statusCode) {
      case 404:
        description = 'We are sorry, the page you requested cannot be found.'
        break

      case 503:
        description = 'Please try reload page.'
        break

      default:
        description = props.error.message || '<%= messages.client_error %>'
        break
    }

    return {
      application,
      statusCode,
      message,
      description,
    }
  },

  head() {
    return {
      htmlAttrs: {
        'data-layout': 'layout_error',
      },
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'error';
</style>
