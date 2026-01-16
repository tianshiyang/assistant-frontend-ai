import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router/index'
import '@/styles/global.css'

const app = createApp(App)

app.use(Antd)
app.use(createPinia())
app.use(router)

app.mount('#app')
