import { AxiosResponse } from 'axios'
import get from 'lodash/get'

declare module 'vue/types/vue' {
  interface Vue {
    handleException(exception: Error, errorMessage: string): void
    handleRequestError(response: AxiosResponse, errorMessage: string): void
  }

  interface VueConstructor {
    handleException(exception: Error, errorMessage: string): void
    handleRequestError(response: AxiosResponse, errorMessage: string): void
  }
}

export default {

  methods: {

    handleException(exception: Error, errorMessage: string): void {
      let errorShown = false

      get(exception, 'response.data.errors', [])
        .forEach((error: any): void => {
          if (parseInt(get(error, 'code', 200), 10) === 422) {
            // @ts-ignore
            this.$toasted.error(get(error, 'detail', ''))

            errorShown = true
          }
        })

      if (!errorShown && errorMessage !== null) {
        // @ts-ignore
        this.$toasted.error(errorMessage)
      }
    },

    handleRequestError(response: AxiosResponse, errorMessage: string): void {
      let errorShown = false

      if (response && Object.prototype.hasOwnProperty.call(response, 'data') && Object.prototype.hasOwnProperty.call(response.data, 'errors')) {
        for (const key in response.data.errors) {
          if (Object.prototype.hasOwnProperty.call(response.data.errors, key) && parseInt(response.data.errors[key].code, 10) === 422) {
            // @ts-ignore
            this.$toasted.error(response.data.errors[key].detail)

            errorShown = true
          }
        }
      }

      if (!errorShown && errorMessage !== null) {
        // @ts-ignore
        this.$toasted.error(errorMessage)
      }
    },

  },

}
