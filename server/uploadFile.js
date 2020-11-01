const path = require('path');
const multiparty = require("multiparty");
const fsextra = require("fs-extra");
const UPLOAD_DIR = path.resolve(__dirname, "uploadFile");

const parse = (req, res) => {
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return;
        }
        const [chunk] = files.chunk;
        const [hash] = fields.hash;
        const [filename] = fields.filename;
        const [fileHash] = fields.fileHash;
        const [fileDirHash] = fields.fileDirHash;
        const chunkDir = path.resolve(UPLOAD_DIR, fileDirHash);
        const file = path.resolve(chunkDir, `${fileHash}`);
        fsextra.ensureDirSync(chunkDir);
        /* 文件是或否已经存在,存在不做处理*/
        fsextra.access(file, fsextra.constants.F_OK, (err) => {
           if (err) {
               fsextra.moveSync(chunk.path, path.resolve(chunkDir, `${fileHash}`));
               res.end(JSON.stringify({
                   status: 0,
                   message: 'received the chunk',
                   data: {
                       hash: `${hash}`
                   }
               }));
           } else {
               res.end(JSON.stringify({
                   status: 0,
                   message: 'received the chunk',
                   data: {
                       hash: `${hash}`
                   }
               }));
           }
        });
    })
};

const receivedFileData = (req, res) => {
    let chunk = '';
    return new Promise((resolve, reject) => {
        req.on('data', (data) => {
            chunk += data;
        });
        req.on('end', () => {
            resolve(JSON.parse(chunk));
        });
        req.on('error', (err) => {
            reject(err);
        })
    })
};

const streamMegeRecursive = (fileName, extname) => {
    const writeFileChunkPath = path.resolve(UPLOAD_DIR, 'file', `${fileName}${extname}`);
    const writeStream = fsextra.createWriteStream(writeFileChunkPath);
    writeStream.on('finish', () => {
        fsextra.remove(path.resolve(UPLOAD_DIR, fileName)).then(res => {
            console.log(`文件：${fileName}合并结束`);
        });
    });
    return function pipeFile(chunkFiles) {
        if (!chunkFiles.length) {
            writeStream.end();
            return false;
        }
        const readChunkPath = path.resolve(UPLOAD_DIR, fileName, chunkFiles.shift());
        const readStream = fsextra.createReadStream(readChunkPath);
        readStream.pipe(writeStream, {
            end: false,
        });
        readStream.on('end', () => {
            pipeFile(chunkFiles, writeStream);
        });
        readStream.on('error', (err) => {
            if (err) {
                throw err
            }
            writeStream.close();
        })
    };
};

/**
 * 合并切片
 * @param fileName
 */
const mergeChunk = (fileName, extName) => {
    const chunkDir = path.resolve(UPLOAD_DIR, fileName); // 单个文件对应的文件夹目录
    const chunkParts = fsextra.readdirSync(chunkDir);
    const chunkFilePath = path.resolve(UPLOAD_DIR, 'file');
    fsextra.ensureDirSync(chunkFilePath);
    chunkParts.sort((a, b) => b.split(fileName)[1] - a.split(fileName)[1] );
    const pipeFileFn = streamMegeRecursive(fileName, extName);
    pipeFileFn(chunkParts);
};

module.exports = {
    parse,
    receivedFileData,
    mergeChunk,
};