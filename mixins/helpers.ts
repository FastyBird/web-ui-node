import { AxiosResponse } from 'axios'
import get from 'lodash/get'

import Session from '~/models/accounts-node/Session'
import Account from '~/models/accounts-node/Account'

export default {

  computed: {

    /**
     * Check if user is signed in or not
     *
     * @returns {Boolean}
     */
    isSignedIn(): boolean {
      return Session.query().exists()
    },

    /**
     * User account details
     *
     * @returns {(Account|null)}
     */
    account(): Account | null {
      const session = Session.query().first()

      if (session === null) {
        return null
      }

      return Account
        .query()
        .where('session_id', session.id)
        .first()
    },

  },

  methods: {

    handleFormError(exception: Error, errorMessage: string): void {
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
