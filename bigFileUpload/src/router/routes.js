import UploadFile from '../components/UploadFile.vue';
import HelloWorld from '../components/HelloWorld.vue';
const routes = [
    {
        path: '/',
        name: 'HelloWorld',
        component: HelloWorld,
    },
    {
        path: '/upload',
        name: 'UploadFile',
        component:  UploadFile
    }
]
export default routes