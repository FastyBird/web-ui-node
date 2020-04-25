export default {

  // Number formatting
  format(number: number, decimals: number, decPoint: string, thousandsSeparator: string): string {
    const cleanedNumber = (`${number}`).replace(/[^0-9+\-Ee.]/g, '')

    const n = !isFinite(+cleanedNumber) ? 0 : +cleanedNumber
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)

    const sep = typeof thousandsSeparator === 'undefined' ? ',' : thousandsSeparator
    const dec = typeof decPoint === 'undefined' ? '.' : decPoint

    let s = []

    const toFixedFix = (fN: number, fPrec: number): string => {
      const k = 10 ** fPrec

      return `${Math.round(fN * k) / k}`
    }

    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : `${Math.round(n)}`).split('.')

    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }

    if ((s[1] || '').length < prec) {
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }

    return s.join(dec)
  },

}
