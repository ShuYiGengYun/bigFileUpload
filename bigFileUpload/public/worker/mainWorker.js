const worker = new Worker('/public/worker/FileChunkWorker.js')
worker.startWork = (file, chunksArray) => {
    worker.postMessage({
      method: 'startFileSlice',
      args: {
          file,
          fileChunks: chunksArray,
      }
  })
};
export default worker;