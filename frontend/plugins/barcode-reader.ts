import { StreamBarcodeReader } from '@teckel/vue-barcode-reader'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('BarcodeReader', StreamBarcodeReader)
})
