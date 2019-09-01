const coreHelpers = {

  methods: {

    /**
     * Check if user is signed in or not
     *
     * @returns {Boolean}
     */
    isSignedIn() {
      return this.$cookie.get('token') !== null
    },

    handleFormError(exception, errorMessage) {
      let errorShown = false

      if (exception.response && exception.response.hasOwnProperty('data') && exception.response.data.hasOwnProperty('errors')) {
        for (const key in exception.response.data.errors) {
          if (exception.response.data.errors.hasOwnProperty(key) && parseInt(exception.response.data.errors[key].code, 10) === 422) {
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

      if (response && response.hasOwnProperty('data') && response.data.hasOwnProperty('errors')) {
        for (const key in response.data.errors) {
          if (response.data.errors.hasOwnProperty(key) && parseInt(response.data.errors[key].code, 10) === 422) {
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

export default coreHelpers
