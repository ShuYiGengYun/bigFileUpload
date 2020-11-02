self.importScripts('../common/spark.min.js');

const fileReader = new FileReader();
const spark = new SparkMD5.ArrayBuffer();
let fileChunksCache = null;
let sparkMD5Hash = null;
let progress = null;
let fileSize = null;
let fileLoaded = null;

const loadNext = (chunks) => {
    if (!chunks.length) {
        return false;
    }
    const chunkFile = fileChunksCache.shift(); // 弹出切片;
    const { chunk } = chunkFile;
    fileReader.readAsArrayBuffer(chunk);
};

fileReader.onload = (event) => {
    const { loaded, target } = event;
    const { result } = target;
    spark.append(result);
    fileLoaded += loaded;
    if (!fileChunksCache.length) {
        sparkMD5Hash = spark.end();
        self.postMessage({
            method: 'FinishFileSlice',
            hash: sparkMD5Hash,
        })
    } else {
        self.postMessage({
            method: 'DoingFileSlice',
            progress: ((fileLoaded / fileSize) * 100).toFixed(2),
        });
        loadNext(fileChunksCache);
    }
};

self.addEventListener('message', (event) => {
   const { method, args } = event.data;
   const { fileChunks, file } = args;
    fileChunksCache = fileChunks;
    fileSize = file.size;
   loadNext(fileChunksCache);
});