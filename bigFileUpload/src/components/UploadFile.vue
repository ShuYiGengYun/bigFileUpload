<template>
   <div>
       <input type="file" @change="handleChange">
       <a-button type="primary" @click="submit">
           上传
       </a-button>
       <div>上传总进度</div>
       {{totalPercent}}
       <a-progress :percent="50" status="active"></a-progress>
   </div>
</template>

<script>
    import { reactive, ref, computed  } from 'vue'
    import { createChunkListsWithHash,uploadChunks } from "./uploadFile";

    export default {
        name: "UploadFile",
        setup() {
            const fileData = ref(null);
            const chunkLists = ref([]);
            const totalPercent = ref(0);

            /*computed*/
            totalPercent.value = computed(() => {
                return fileData.value.size;
            });


            /*events*/
            const handleChange = (e) => {
                const [file] = e.target.files;
                fileData.value = file;
                chunkLists.value = createChunkListsWithHash(file);
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
                totalPercent
            }
        }
    }
</script>

<style scoped>

</style>