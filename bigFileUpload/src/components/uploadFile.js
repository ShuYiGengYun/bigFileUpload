import { inject } from 'vue';
export const SIZE = 10 * 1024 * 1024;
export const REQUEST_URL = 'http://localhost:3001/';
/*inject*/
export const getMainWorker = () => {
    return inject('$worker');
};

export const noop = function () {

};
export const request = ({ url, method = 'post', data, headers = {}, onprogress = noop, xhrLists = []}) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = onprogress;
        xhr.open(method, url);
        Object.keys(headers).forEach(item => {
            xhr.setRequestHeader(item, headers[item]);
        });
        xhr.send(data);
        xhr.onreadystatechange = (res) => {
            const { readyState, status  } = xhr;
            if (readyState === 4 && status === 200) {
                resolve(res.target.response);
            }
            if (xhrLists.length) {
                const xhrIndex = xhrLists.findIndex(item => item === xhr);
                xhrLists.splice(xhrIndex, 1);
            }
        };
        xhrLists.push(xhr) // 把所有xhr放入到xhrList
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

export const uploadChunks = async (file, chunkLists, fileDirHash, xhrLists) => {
    const chunkListsWidthHash = chunkLists;
    const requestLists = createRequestLists(chunkListsWidthHash, file, xhrLists);
    await Promise.all(requestLists);
    notifyMegeChunk(file, fileDirHash);
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

export const createRequestLists = (chunkListsWidthHash, file, xhrLists) => {
    const { name } = file;
    const requestFormDataArray = chunkListsWidthHash.map(({ chunk, hash, fileHash, fileDirHash }) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('hash', hash);
        formData.append('filename', name);
        formData.append('fileHash',fileHash);
        formData.append('fileDirHash',fileDirHash);
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
                currentChunk.percent = currentChunk.percent > (loaded / total) ? currentChunk.percent : (loaded / total); // 原来是否有已经上传的部分;
            },
            xhrLists,
        })
    })
};

export const notifyMegeChunk = (file, fileDirHash) => {
    const { name, size } = file;
    request({
        url: `${REQUEST_URL}/merge`,
        headers: {
            "content-type": "application/json",
        },
        data: JSON.stringify({
            filesize: size,
            filename: name,
            fileDirHash,
        }),
    })
}
/**
 * 匹配键值;
 * @param params
 * @returns {Function}
 */
export const mapKey = (params =  {}) => {
    return function (key) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            return params[key];
        }
        return null;
    }
}


export const verifyUpload  = (fileHash, fileName) => {
    return request({
        url: `${REQUEST_URL}/verify`,
        headers: {
            "content-type": "application/json",
        },
        data: JSON.stringify({
            fileHash,
            fileName,
        })
    })
}

