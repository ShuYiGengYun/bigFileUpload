<template>
    <div>
        <input type="file" @change="handleChange($event)">
        <a-button type="primary" @click="handleSubmit()">上传</a-button>
        <a-button type="primary" @click="handlePause()" style="margin-left: 20px;">{{state.isPaused ? '恢复' : '暂停'}}</a-button>
        <div>上传进度</div>
        <a-progress :percent="totalPercentValue || state.isExit ? 100 : 0" :status="progressStatusValue" style="width: 50%;"></a-progress>
        <div>切片进度</div>
        <a-progress :percent="state.fileSliceProgress" style="width: 50%;"></a-progress>
        <upload-list :lists="state.fileChunks"></upload-list>
    </div>
</template>

<script>
    import UploadList from './UploadList.vue';
    import {reactive, ref, computed, watch, inject, toRaw} from 'vue';
    import {
        createChunkListsWithHash,
        uploadChunks,
        mapKey,
        getMainWorker,
        SIZE,
        verifyUpload
    } from './uploadFile';

    export default {
        name: 'HelloWorld',
        components: {
            UploadList,
        },
        setup() {
            const state = reactive({
                file: [],
                fileChunks: [],
                fileSliceProgress: 0,
                fileDirHash: null,
                xhrLists: [],
                isExit: false,
                isPaused: false,
            });

            /*inject*/
            const mainWorker = getMainWorker();

            const totalPercentValue = computed(() => {
                return state.fileChunks.reduce((totalValue, currentValue, currentIndex, arr) => {
                    return (totalValue + currentValue.percent) * 100;
                }, 0)
            });
            const progressStatusValue = computed(() => {
                const getValueByKey = mapKey({0: 'active', 100: 'success'});
                return getValueByKey(totalPercentValue);
            });

            const handleChange = (e) => {
                const [file] = e.target.files;
                state.file = file;
                state.fileChunks = createChunkListsWithHash(file);
                mainWorker.startWork(file, toRaw(state.fileChunks));
                mainWorker.addEventListener('message', (event) => {
                    const { data } = event;
                    const { method, hash } = data;
                    if (method === 'FinishFileSlice') {
                        state.fileChunks = state.fileChunks.map((file, index) => {
                            return Object.assign(file, { fileHash: `${hash}-${index}`, fileDirHash: hash});
                        });
                        state.fileSliceProgress = 100;
                        state.fileDirHash = hash;
                    } else if (method === 'DoingFileSlice') { // 正在切片用于显示progress
                        const { progress } = data;
                        state.fileSliceProgress = parseFloat(progress);
                    }
                })
            };
            const handleSubmit = async () => {
                if (!state.fileChunks.length) {
                    alert('请先上传图片');
                    return false;
                }
                if (state.fileSliceProgress < 100) {
                    alert('请等待图片切片完成再上传');
                    return false;
                }
                try {
                    const result = await verifyUpload(state.fileDirHash, state.file.name);
                    const { status, message, data } = JSON.parse(result);
                    if (status === 0 && data.isExit) {
                        state.isExit = data.isExit;
                    }
                }catch (e) {

                }
                if (state.isExit) {
                    return false;
                }
                try {
                    await uploadChunks(state.file, state.fileChunks, state.fileDirHash, state.xhrLists);
                } catch (e) {

                }
            };

            /*暂停或恢复*/
            const handlePause = async () => {
                state.isPaused  = !state.isPaused;
                if (state.isPaused && state.xhrLists.length) {
                    state.xhrLists.forEach(xhr => {
                        xhr.abort();
                    })
                } else if (!state.isPaused) {
                    const result = await verifyUpload(state.fileDirHash, state.file.name);
                    const { data, message, status} = JSON.parse(result);
                    const { isExit, uploadedFileHash } = data;
                    const filteredFileChunksHash = state.fileChunks.filter(chunk => !uploadedFileHash.includes(chunk.fileHash));
                    console.log(uploadedFileHash);
                    console.log(state.fileChunks);
                    await uploadChunks(state.file, filteredFileChunksHash, state.fileDirHash, state.xhrLists)
                }

            };

            return {
                handleChange,
                handleSubmit,
                handlePause,
                totalPercentValue,
                progressStatusValue,
                state
            }
        }
    }
</script>
