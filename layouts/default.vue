<template>
  <div class="fb-application__container">
    <nuxt />

    <fb-ui-page-loading v-if="loadingOverlay" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  SetupContext,
} from '@vue/composition-api'

export default defineComponent({

  name: 'LayoutDefault',

  setup(props: { }, context: SetupContext) {
    const loadingOverlay = ref<boolean>(true)

    // Processing timer
    let overlayTimer: number

    function hideOverlay() {
      loadingOverlay.value = false

      window.clearInterval(overlayTimer)
    }

    onBeforeMount((): void => {
      context.root.$bus.$on('wait-page_reloading', (status?: number | boolean): void => {
        if (typeof status === 'number') {
          overlayTimer = window.setInterval(hideOverlay, status * 1000)

          loadingOverlay.value = true
        } else if (status === false && overlayTimer !== 0) {
          window.clearInterval(overlayTimer)

          overlayTimer = window.setInterval(hideOverlay, 500)
        } else if (typeof status !== 'undefined') {
          loadingOverlay.value = status
        }
      })
    })

    onMounted((): void => {
      context.root.$bus.$on('user_signed-in', (): void => {
        context.root.$router.push(
          context.root.localePath({ name: context.root.$routes.home }),
          (): void => {
            context.root.$bus.$emit('wait-page_reloading', false)
            context.root.$wamp.open()
          },
        )
      })

      context.root.$bus.$on('user_signed-out', (): void => {
        context.root.$router.push(
          context.root.localePath({ name: context.root.$routes.account.signIn }),
          (): void => {
            context.root.$bus.$emit('wait-page_reloading', false)
            context.root.$wamp.open()
          },
        )
      })
    })

    onBeforeUnmount((): void => {
      context.root.$bus.$off('wait-page_reloading')
    })

    return {
      loadingOverlay,
    }
  },

  head() {
    return {
      bodyAttrs: {
        'data-page': this._.get(this.$route, 'name', 'not-defined'),
      },
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'default';
</style>
