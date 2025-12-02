import { createRouter, createWebHashHistory } from 'vue-router' // 👈 createWebHashHistory kullanıldı

import HomeView from '../views/HomeView.vue'
import Results from '../views/ResultsPage.vue'

const routes = [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/sonuclar', name: 'Results', component: Results } // Name eklemek pratiklik sağlar
]

export const router = createRouter({
    history: createWebHashHistory(), // 👈 Hash mode burada
    routes,
})

export default router
