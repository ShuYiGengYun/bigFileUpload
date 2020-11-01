<template>
   <div>
       <div class="top-bar">
           <div class="hash">切片hash</div>
           <div class="size">大小</div>
           <div class="progress">进度</div>
       </div>
       <ul>
           <li class="list-item" v-for="(item, index) in lists" :key="index">
               <div class="hash">{{item.hash}}</div>
               <div class="size">{{item.chunk}}</div>
               <div class="progress">
                   <a-progress :percent="item.percent * 100"></a-progress>
               </div>
           </li>
       </ul>
   </div>
</template>
<script>
    import {toRefs, reactive, computed } from 'vue';
    export default {
        name: 'UploadList',
        props: {
            lists: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            text: {

            }
        },
        setup(props, { attrs, slots, emit }) {
            return {
                ...toRefs(props)
            };
        }
    };
</script>
<style scoped>
    ul{
        list-style: none;
    }
    .top-bar{
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-top: 20px;
    }
    .top-bar .hash{
        width: 400px;
        text-align: center;
    }
    .top-bar .size{
        width: 300px;
        text-align: center;
    }
    .top-bar .progress{
        flex: 1;
        text-align: center;
    }
    .list-item{
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    .list-item .hash{
        width: 400px;
    }
    .list-item .size{
        width: 300px;
    }
    .list-item .progress{
        flex: 1;
    }
</style>
