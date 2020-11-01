const http = require("http");
const path = require("path");
const fsextra = require('fs-extra');
const server = http.createServer();
const parseUploadFile = require('./uploadFile');
server.on("request", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
        res.status = 200;
        res.end();
        return;
    }
    if (req.method === 'POST') {
        switch (req.url){
            case '//upload':
                parseUploadFile.parse(req, res);
                break;
            case '//merge':
                const fileData = await parseUploadFile.receivedFileData(req, res);
                const { filename, filesize, fileDirHash } = fileData;
                const filePath = path.resolve(__dirname, `${fileDirHash}`);
                const extName = path.extname(filename);
                parseUploadFile.mergeChunk(fileDirHash, extName);
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(JSON.stringify({
                    status: 0,
                    message: '文件合并成功',
                    data: null,
                }));
                break;
            case '//verify':
                const result = await parseUploadFile.receivedFileData(req, res);
                const { fileHash, fileName } = result;
                const extname = path.extname(fileName);
                const UPLOAD_DIR = path.resolve(__dirname, 'uploadFile','file');
                const file = path.resolve(UPLOAD_DIR,  `${fileHash}${extname}`);
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                const FILE_DIR = path.resolve(__dirname, 'uploadFile', `${fileHash}`);
                if (fsextra.pathExistsSync(FILE_DIR)) { // 没上传完全;
                   const dirPath =  fsextra.readdirSync(FILE_DIR);
                   res.end(JSON.stringify({
                       status: 0,
                       message: '文件没有生成',
                       data: {
                           isExit: false,
                           uploadedFileHash: dirPath,
                       }
                   }));
                } else {
                    fsextra.access(file, fsextra.constants.F_OK, (err) => {
                        if (!err) {
                            res.end(JSON.stringify({
                                status: 0,
                                message: '文件存在',
                                data: {
                                    isExit: true,
                                }
                            }));
                        } else {
                            res.end(JSON.stringify({
                                status: 0,
                                message: '文件不存在',
                                data: {
                                    isExit: false,
                                }
                            }));
                        }
                    });
                }
                break;
            default:
                break;
        }
    }
});

const PORT = 3001;
server.listen(PORT, () => console.log(`正在监听 ${PORT} 端口`));
