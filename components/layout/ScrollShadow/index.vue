<template>
  <div
    ref="rootContainer"
    class="fb-scroll-shadow__container"
  >
    <div
      ref="scrollContainer"
      :style="{ width, height }"
      @scroll.passive="handleToggleShadow"
      class="fb-scroll-shadow__inner"
    >
      <slot />

      <span :class="['fb-scroll-shadow__shadow-top', {'fb-scroll-shadow__shadow-active': shadow.top}]" />
      <span :class="['fb-scroll-shadow__shadow-right', {'fb-scroll-shadow__shadow-active': shadow.right}]" />
      <span :class="['fb-scroll-shadow__shadow-bottom', {'fb-scroll-shadow__shadow-active': shadow.bottom}]" />
      <span :class="['fb-scroll-shadow__shadow-left', {'fb-scroll-shadow__shadow-active': shadow.left}]" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  SetupContext,
} from '@vue/composition-api'

function newResizeObserver(callback: () => void) {
  // Skip this feature for browsers which
  // do not support ResizeObserver
  // https://caniuse.com/#search=resizeobserver
  // @ts-ignore
  if (typeof ResizeObserver === 'undefined') {
    return
  }

  // @ts-ignore
  return new ResizeObserver((e: Array<Element>) => e.map(callback))
}

export default defineComponent({

  name: 'ScrollShadow',

  setup(props: {}, context: SetupContext) {
    const width = ref<string | undefined>(undefined)
    const height = ref<string | undefined>(undefined)

    const shadow = reactive({
      top: false,
      right: false,
      bottom: false,
      left: false,
    })

    const rootContainer = ref<HTMLElement | null>(null)
    const scrollContainer = ref<HTMLElement | null>(null)

    function handleToggleShadow(): void {
      if (scrollContainer.value !== null) {
        const hasHorizontalScrollbar = scrollContainer.value.clientWidth < scrollContainer.value.scrollWidth
        const hasVerticalScrollbar = scrollContainer.value.clientHeight < scrollContainer.value.scrollHeight

        const scrolledFromLeft = scrollContainer.value.offsetWidth + scrollContainer.value.scrollLeft
        const scrolledFromTop = scrollContainer.value.offsetHeight + scrollContainer.value.scrollTop

        const scrolledToTop = scrollContainer.value.scrollTop === 0
        const scrolledToRight = scrolledFromLeft >= scrollContainer.value.scrollWidth
        const scrolledToBottom = scrolledFromTop >= scrollContainer.value.scrollHeight
        const scrolledToLeft = scrollContainer.value.scrollLeft === 0

        shadow.top = hasVerticalScrollbar && !scrolledToTop
        shadow.right = hasHorizontalScrollbar && !scrolledToRight
        shadow.bottom = hasVerticalScrollbar && !scrolledToBottom
        shadow.left = hasHorizontalScrollbar && !scrolledToLeft
      }
    }

    async function handleCalcDimensions(): Promise<void> {
      // Reset dimensions for correctly recalculating parent dimensions
      width.value = undefined
      height.value = undefined

      await context.root.$nextTick()

      if (rootContainer.value !== null) {
        width.value = `${rootContainer.value.clientWidth}px`
        height.value = `${rootContainer.value.clientHeight}px`
      }
    }

    onMounted((): void => {
      // Check if shadows are necessary after the element is resized.
      const scrollContainerObserver = newResizeObserver(handleToggleShadow)

      if (scrollContainerObserver) {
        scrollContainerObserver.observe(scrollContainer.value)

        // Cleanup when the component is destroyed
        context.root.$once('hook:destroyed', () => scrollContainerObserver.disconnect())
      }

      // Recalculate the container dimensions when the wrapper is resized.
      const wrapObserver = newResizeObserver(handleCalcDimensions)

      if (wrapObserver) {
        wrapObserver.observe(rootContainer.value)

        // Cleanup when the component is destroyed
        context.root.$once('hook:destroyed', () => wrapObserver.disconnect())
      }
    })

    return {
      width,
      height,
      shadow,
      rootContainer,
      scrollContainer,
      handleToggleShadow,
    }
  },
})
</script>

<style rel="stylesheet/scss" lang="scss">
@import 'index';
</style>
