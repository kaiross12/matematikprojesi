// main.js dosyası
import { createApp } from 'vue'
import App from './App.vue'
// Doğru: Varsayılan içe aktarma
import router from './router' 

createApp(App)
    .use(router)
    .mount('#app')