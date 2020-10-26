export const SIZE = 10 * 1024 * 1024;
export const REQUEST_URL = 'http://localhost:3001/'
export const noop = function () {

};
export const request = ({ url, method = 'post', data, headers = {}, onprogress = noop}) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = onprogress;
        xhr.open(method, url);
        Object.keys(headers).forEach(item => {
            xhr.setRequestHeader(item, headers[item]);
        });
        xhr.send(data);
        xhr.onreadystatechange = (res) => {
            const { status } = xhr;
            if (status === 200 || status === 301) {
                resolve(res);
            }else {
                reject(res);
            }
        };
    })
};
export const createFileChunk  = (file, size = SIZE) => {
    const fileChunkLists = [];
    let cur = 0;
    while (cur < file.size){
        fileChunkLists.push({
            file: file.slice(cur, cur + size),
        });
        cur += size;
    }
    return fileChunkLists;
};

export const uploadChunks = async (file, chunkLists) => {
    const chunkListsWidthHash = chunkLists;
    const requestLists = createRequestLists(chunkListsWidthHash, file);
    await Promise.all(requestLists);
    notifyMegeChunk(file);
};

export const createChunkListsWithHash = (file) => {
    const { name } = file;
    const fileChunksList = createFileChunk(file);
    return fileChunksList.map(({ file }, index) => {
        return {
            chunk: file,
            hash: `${name}-${index}`,
            percent: 0,
        }
    });
};

export const createRequestLists = (chunkListsWidthHash, file) => {
    const { name } = file;
    const requestFormDataArray = chunkListsWidthHash.map(({ chunk, hash }) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('hash', hash);
        formData.append('filename', name);
        return {
            formData,
        }
    });
    return requestFormDataArray.map(({ formData }, index) => {
        return request({
            url: `${REQUEST_URL}/upload`,
            data: formData,
            onprogress: function (response) {
                const currentChunk = chunkListsWidthHash[index];
                const { loaded, total } = response;
                currentChunk.percent = loaded / total;
            }
        })
    })
};

export const notifyMegeChunk = (file) => {
    const { name, size } = file;
    request({
        url: `${REQUEST_URL}/merge`,
        headers: {
            "content-type": "application/json",
        },
        data: JSON.stringify({
            filesize: size,
            filename: name,
        }),
    })
}