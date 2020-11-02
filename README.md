# bigFileUpload
slice big file upload  
根据掘金这篇[字节跳动面试官：请你实现一个大文件上传和断点续传](https://juejin.im/post/6844904046436843527)

第一版实现很粗糙，还有很多需要优化的地方，有时间再优化一下。

# 前端
* vue3.0 + vue-router
* ant-design-vue
* webworker

安装依赖：npm install 记得vue-cli要4.0以上哦
运行 npm run dev


# 后台
* fs-extra 
* nodemon 
* multiparty

安装依赖 npm install 
运行 npm run dev