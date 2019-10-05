import Vue from 'vue'

// Components
import FbMdFormCheckbox from '@/node_modules/@fastybird-com/theme/components/Forms/FbMdCheckbox'
import FbMdFormCheckboxesGroup from '@/node_modules/@fastybird-com/theme/components/Forms/FbMdCheckboxesGroup'
import FbMdFormDatePicker from '@/node_modules/@fastybird-com/theme/components/Forms/FbMdDatePicker'
import FbMdFormInput from '@/node_modules/@fastybird-com/theme/components/Forms/FbMdInput'
import FbMdFormRadioButton from '@/node_modules/@fastybird-com/theme/components/Forms/FbMdRadioButton'
import FbMdFormRadioButtonsGroup from '@/node_modules/@fastybird-com/theme/components/Forms/FbMdRadioButtonsGroup'
import FbMdFormSelect from '@/node_modules/@fastybird-com/theme/components/Forms/FbMdSelect'
import FbMdFormTextArea from '@/node_modules/@fastybird-com/theme/components/Forms/FbMdTextArea'

// Layout components
import FbButton from '@/node_modules/@fastybird-com/theme/components/UI/FbButton'
import FbCardBox from '@/node_modules/@fastybird-com/theme/components/UI/FbCardBox'
import FbConfirmationWindow from '@/node_modules/@fastybird-com/theme/components/UI/FbConfirmationWindow'
import FbModalForm from '@/node_modules/@fastybird-com/theme/components/UI/FbModalForm'
import FbModalInfo from '@/node_modules/@fastybird-com/theme/components/UI/FbModalInfo'
import FbModalWindow from '@/node_modules/@fastybird-com/theme/components/UI/FbModalWindow'
import FbLoadingBox from '@/node_modules/@fastybird-com/theme/components/UI/FbLoadingBox'
import FbPageLoading from '@/node_modules/@fastybird-com/theme/components/UI/FbPageLoading'

import ThemeHelpersMixin from '@/node_modules/@fastybird-com/theme/mixins/helpers'

import ThemeClickOutsideDirective from '@/node_modules/@fastybird-com/theme/directives/ClickOutside'

Vue.component('FbMdFormCheckbox', FbMdFormCheckbox)
Vue.component('FbMdFormCheckboxesGroup', FbMdFormCheckboxesGroup)
Vue.component('FbMdFormDatePicker', FbMdFormDatePicker)
Vue.component('FbMdFormInput', FbMdFormInput)
Vue.component('FbMdFormRadioButton', FbMdFormRadioButton)
Vue.component('FbMdFormRadioButtonsGroup', FbMdFormRadioButtonsGroup)
Vue.component('FbMdFormSelect', FbMdFormSelect)
Vue.component('FbMdFormTextArea', FbMdFormTextArea)

Vue.component('FbButton', FbButton)
Vue.component('FbCardBox', FbCardBox)
Vue.component('FbConfirmationWindow', FbConfirmationWindow)
Vue.component('FbModalForm', FbModalForm)
Vue.component('FbModalInfo', FbModalInfo)
Vue.component('FbModalWindow', FbModalWindow)
Vue.component('FbLoadingBox', FbLoadingBox)
Vue.component('FbPageLoading', FbPageLoading)

Vue.mixin(ThemeHelpersMixin)

Vue.directive('clickOutside', ThemeClickOutsideDirective)
