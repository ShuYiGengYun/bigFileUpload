import { createApp } from 'vue'
import router from './router/index'
import App from './App.vue'
import './index.css'

/*components*/
import 'ant-design-vue/lib/button/style/index.css'
import 'ant-design-vue/lib/progress/style/index.css'
import 'ant-design-vue/lib/list/style/index.css'
import { Button, Progress,List } from 'ant-design-vue'

/*web-worker*/
import worker from '../public/worker/mainWorker';




const app = createApp(App)

app.provide('$worker', worker);

app.use(router);
app.mount('#app');
app.use(Button);
app.use(Progress);
app.use(List);
