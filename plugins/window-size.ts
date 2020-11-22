import { Store } from 'vuex'
import { Plugin } from '@nuxt/types'
import { FbSizeTypes } from '@fastybird/web-ui-theme'

declare module 'vue/types/vue' {
    interface Vue {
        $windowSize: WindowSizeInterface
    }
}

declare module '@nuxt/types' {
    interface NuxtAppOptions {
        $windowSize: WindowSizeInterface
    }
}

declare module 'vuex/types/index' {
    interface Store<S> {
        $windowSize: WindowSizeInterface
    }
}

interface WindowSizeInterface {
    getSize(): FbSizeTypes
    isExtraSmall(): boolean
    isSmall(): boolean
    isMedium(): boolean
    isLarge(): boolean
    isExtraLarge(): boolean
}

class WindowSize implements WindowSizeInterface {
    private readonly store: Store<any>

    constructor(store: Store<any>) {
      this.store = store
    }

    getSize(): FbSizeTypes {
      return this.store.state.app.windowSize
    }

    isExtraSmall(): boolean {
      return this.store.state.app.windowSize === FbSizeTypes.EXTRA_SMALL
    }

    isSmall(): boolean {
      return this.store.state.app.windowSize === FbSizeTypes.SMALL
    }

    isMedium(): boolean {
      return this.store.state.app.windowSize === FbSizeTypes.MEDIUM
    }

    isLarge(): boolean {
      return this.store.state.app.windowSize === FbSizeTypes.LARGE
    }

    isExtraLarge(): boolean {
      return this.store.state.app.windowSize === FbSizeTypes.EXTRA_LARGE
    }
}

const windowSizePlugin: Plugin = ({ store }, inject): void => {
  inject('windowSize', new WindowSize(store))
}

export default windowSizePlugin
