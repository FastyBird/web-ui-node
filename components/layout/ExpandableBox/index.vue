<template>
  <div
    ref="element"
    class="fb-expandable-box__container"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api'

export default defineComponent({

  name: 'ExpandableBox',

  props: {

    show: {
      type: Boolean,
      default: false,
    },

  },

  setup(props) {
    const element = ref<HTMLElement | null>(null)

    function setBoxHeight(): void {
      if (element.value !== null && element.value.parentElement !== null) {
        element.value.style.height = props.show ? `${element.value.parentElement.clientHeight}px` : '0px'
      }
    }

    onMounted((): void => {
      setBoxHeight()

      window.addEventListener('resize', setBoxHeight)
    })

    onBeforeUnmount((): void => {
      window.removeEventListener('resize', setBoxHeight)
    })

    watch(
      (): boolean => props.show,
      (): void => {
        setBoxHeight()
      },
    )

    return {
      element,
    }
  },

})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
