<template>
   <div>
       <input type="file" @change="handleChange">
       <a-button type="primary" @click="submit">
           上传
       </a-button>
       <div>上传总进度</div>
       <a-progress :percent="50" status="active"></a-progress>
   </div>
</template>

<script>
    import { reactive, ref } from 'vue'
    import { createChunkListsWithHash,uploadChunks } from "./uploadFile";

    export default {
        name: "UploadFile",
        setup() {
            const fileData = ref(null);
            const chunkLists = ref([]);
            /*events*/
            const handleChange = (e) => {
                const [file] = e.target.files;
                fileData.value = file;
                chunkLists.value = createChunkListsWithHash(file, chunkLists);
            };
            const submit = async () => {
                try {
                   await uploadChunks(fileData.value, chunkLists);
                }catch (e) {

                }
            }
            return {
                handleChange,
                submit,
            }
        }
    }
</script>

<style scoped>

</style>