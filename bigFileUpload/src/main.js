import { createApp } from 'vue'
import router from './router/index'
import App from './App.vue'
import './index.css'

/*components*/
import 'ant-design-vue/lib/button/style/index.css'
import 'ant-design-vue/lib/progress/style/index.css'
import { Button, Progress } from 'ant-design-vue'


const app = createApp(App)
app.use(router)

app.mount('#app')
app.use(Button)
app.use(Progress)
