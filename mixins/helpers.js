import Session from '~/models/accounts-node/Session'

export default {

  computed: {

    /**
     * Check if user is signed in or not
     *
     * @returns {Boolean}
     */
    isSignedIn() {
      return Session.query().exists()
    },

  },

  methods: {

    handleFormError(exception, errorMessage) {
      let errorShown = false

      if (exception.response && Object.prototype.hasOwnProperty.call(exception.response, 'data') && Object.prototype.hasOwnProperty.call(exception.response.data, 'errors')) {
        for (const key in exception.response.data.errors) {
          if (Object.prototype.hasOwnProperty.call(exception.response.data.errors, key) && parseInt(exception.response.data.errors[key].code, 10) === 422) {
            this.$toasted.error(exception.response.data.errors[key].detail)

            errorShown = true
          }
        }
      }

      if (!errorShown && errorMessage !== null) {
        this.$toasted.error(errorMessage)
      }
    },

    handleRequestError(response, errorMessage) {
      let errorShown = false

      if (response && Object.prototype.hasOwnProperty.call(response, 'data') && Object.prototype.hasOwnProperty.call(response.data, 'errors')) {
        for (const key in response.data.errors) {
          if (Object.prototype.hasOwnProperty.call(response.data.errors, key) && parseInt(response.data.errors[key].code, 10) === 422) {
            this.$toasted.error(response.data.errors[key].detail)

            errorShown = true
          }
        }
      }

      if (!errorShown && errorMessage !== null) {
        this.$toasted.error(errorMessage)
      }
    },

  },

}
