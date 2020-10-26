const http = require("http");
const path = require("path");
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
                const { filename, filesize } = fileData;
                const filePath = path.resolve(__dirname, `${filename}`);
                parseUploadFile.mergeChunk(filename);
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(JSON.stringify({
                    status: 0,
                    message: '文件合并成功',
                    data: null,
                }));
                break;
            default:
                break;
        }
    }
});

const PORT = 3001;
server.listen(PORT, () => console.log(`正在监听 ${PORT} 端口`));
