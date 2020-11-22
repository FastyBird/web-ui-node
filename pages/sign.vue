<template>
  <div class="fb-sign__container">
    <div class="fb-sign__container-inner">
      <fb-layout-sign-box>
        <nuxt-link
          slot="logo"
          :to="localePath({ name: $routes.account.signIn })"
          class="fb-sign__logo"
        >
          <logo />
        </nuxt-link>

        <nuxt-child />
      </fb-layout-sign-box>

      <fb-layout-sign-footer>
        <template slot="info">
          <p v-if="$route.path === localePath({ name: $routes.account.signUp })">
            Already have an account?
            <nuxt-link :to="localePath({ name: $routes.account.signIn })">
              Sign in
            </nuxt-link>
          </p>

          <p v-else>
            Don't have an account?
            <nuxt-link :to="localePath({ name: $routes.account.signUp })">
              Sign up
            </nuxt-link>
          </p>
        </template>

        <template slot="links">
          <fb-layout-sign-footer-item>
            <nuxt-link :to="localePath({ name: $routes.account.signUp })">
              Sign up
            </nuxt-link>
          </fb-layout-sign-footer-item>
          <fb-layout-sign-footer-item>
            <a href="#">Privacy Policy</a>
          </fb-layout-sign-footer-item>
          <fb-layout-sign-footer-item>
            <a href="#">Terms</a>
          </fb-layout-sign-footer-item>
          <fb-layout-sign-footer-item>
            <a href="#">Cookie Policy</a>
          </fb-layout-sign-footer-item>
          <fb-layout-sign-footer-item class="fb-sign__owner">
            &copy;
            <a
              :href="application.website"
              target="_blank"
            >
              {{ application.author }}
            </a> 2017
          </fb-layout-sign-footer-item>
        </template>
      </fb-layout-sign-footer>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  SetupContext,
} from '@vue/composition-api'

import { version } from './../package.json'

import * as config from '~/configuration'

// @ts-ignore
import Logo from '~/assets/images/fastybird_bird.svg?inline'

interface SignPageApplicationInterface {
  author: string
  website: string
  version: string
}

export default defineComponent({

  name: 'SignPage',

  middleware: 'anonymous',

  transition: 'fade',

  components: {
    Logo,
  },

  setup(props: { }, context: SetupContext) {
    const application = reactive<SignPageApplicationInterface>({
      author: config.AUTHOR_NAME,
      website: config.AUTHOR_WEBSITE,
      version,
    })

    onMounted((): void => {
      context.root.$bus.$emit('wait-page_reloading', false)
    })

    return {
      application,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'sign';
</style>
