import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './utils/authInterceptor';
import axios from "axios";

axios.defaults.withCredentials = true;

createApp(App)
    .use(router)
    .mount('#app')
