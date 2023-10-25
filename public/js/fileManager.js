let uploadBtn = document.getElementById('uploadBtn')
let resetFileBtn = document.getElementById('resetFileBtn')
let logoutBtn = document.getElementById('logoutBtn')
let fileInput = document.getElementById('file')
let filesInput = document.getElementById('files')
let fileDirInput = document.getElementById('fileDir')
let fileListTable = document.getElementById('fileListTable')
let fileList = []

function updateFileList() {
    fileList = []
    for (let t of [fileInput, filesInput, fileDirInput]) {
        for (let file of t.files) {
            fileList.push(file);
        }
    }
    uploadBtn.value = `上傳 ${fileList.length} 個檔案`
    if (fileList.length > 0) {
        uploadBtn.disabled = false
    } else {
        uploadBtn.disabled = true
    }
}

function resetFileList() {
    fileInput.value = ''
    filesInput.value = ''
    fileDirInput.value = ''
    updateFileList()
}

function getFileList() {
    fetch('/file', {
        method: 'GET'
    }).then(res => {
        return res.json()
    }).then(res => {
        if (res.data?.length > 0) {
            // 清空行
            let rows = fileListTable.getElementsByTagName('tr');
            for (let i = rows.length - 1; i > 0; i--) {
                fileListTable.deleteRow(i);
            }
            // 新增行
            for (let i = 0; i < res.data.length; i++) {
                let d = res.data[i]
                let newRow = fileListTable.insertRow(-1)
                let cell1 = newRow.insertCell(0)
                cell1.innerHTML = i + 1
                let cell2 = newRow.insertCell(1)
                cell2.innerHTML = d['fileName']
                let cell3 = newRow.insertCell(2)
                cell3.innerHTML = d['fileSize']
                let cell4 = newRow.insertCell(3)
                // 新增下載檔案按鈕
                let downloadBtn = document.createElement('button');
                downloadBtn.textContent = '下載'
                downloadBtn.id = 'downloadBtn'
                downloadBtn.addEventListener('click', (e) => {
                    downloadFile(d['fileName'])
                })
                cell4.append(downloadBtn)
                // 新增刪除檔案按鈕
                let deleteBtn = document.createElement('button');
                deleteBtn.textContent = '刪除'
                deleteBtn.id = 'deleteBtn'
                deleteBtn.addEventListener('click', (e) => {
                    deleteFile(d['fileName'])
                })
                cell4.append(deleteBtn)
                // 新增重新命名按鈕
                let editBtn = document.createElement('button');
                editBtn.textContent = '重新命名'
                editBtn.id = 'editBtn'
                editBtn.addEventListener('click', (e) => editFile(cell2, editBtn, d['fileName']))
                cell4.append(editBtn)
            }
        }
    }).catch(e => {
        console.log(e);
        alert('取得檔案清單錯誤')
    });
}

function downloadFile(fileName) {
    fetch(`/file/${fileName}`, {
        method: 'GET'
    }).then(res => {
        if (res.ok) {
            return res.blob()
        } else {
            return res.json()
        }
    }).then(res => {
        if (res.status == 'ERROR') {
            throw new Error(res.message)
        } else {
            // Download file
            const url = window.URL.createObjectURL(res);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName; // 指定下载的文件名
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    }).catch(e => {
        alert('取得檔案失敗')
        console.log(e)
    })
}

function editFile(cell, editBtn, oldName) {
    if (editBtn.textContent == "重新命名") {
        // Add edit input
        let editNameInput = document.createElement('input')
        editNameInput.value = oldName
        editBtn.textContent = '確定命名'
        cell.innerHTML = ''
        cell.append(editNameInput)
    } else if (editBtn.textContent == "確定命名") {
        let editNameInput = cell.childNodes[0]
        let newName = editNameInput.value
        // Update file name
        if (newName && (newName != oldName)) {
            fetch(`/file/${oldName}?newName=${newName}`, {
                method: 'PUT'
            }).then(res => {
                return res.json()
            }).then(res => {
                alert(res.message)
            }).catch(e => {
                console.log(e)
                alert('更新名字錯誤')
            }).finally(() => {
                getFileList()
            })
        }
        // Remove edit input
        cell.removeChild(editNameInput)
        editBtn.textContent = '重新命名'
    }
}

function deleteFile(fileName) {
    fetch(`/file/${fileName}`, {
        method: 'DELETE'
    }).then(res => {
        return res.json()
    }).then(res => {
        alert(res.message)
    }).catch(e => {
        alert('無法刪除檔案')
        console.log(e)
    }).finally(() => {
        getFileList()
    })
}

function getCookie(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ");
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

// 新增檔案事件
fileInput.addEventListener('change', (e) => {
    updateFileList()
})
filesInput.addEventListener('change', (e) => {
    updateFileList()
})
fileDirInput.addEventListener('change', (e) => {
    updateFileList()
})

// 清空檔案清單
resetFileBtn.addEventListener('click', (e) => {
    resetFileList()
})

// 上傳檔案
uploadBtn.addEventListener('click', (e) => {
    const fileForm = new FormData
    for (let file of fileList) {
        fileForm.append('file[]', file)
    }
    fetch('/file', {
        method: 'POST',
        body: fileForm
    }).then(res => {
        return res.json()
    }).then(res => {
        alert(res.message);
        resetFileList()
    }).catch(e => {
        console.log(e);
        alert('上傳失敗')
    }).finally(() => {
        getFileList()
    });
})

logoutBtn.addEventListener('click', (e) => {
    document.location.href = '/user/logout'
})

const userInfo = getCookie("userInfo");
if (userInfo) {
    let loginUserSpan = document.getElementById('loginUserSpan')
    let { firstName, lastName } = JSON.parse(userInfo)
    loginUserSpan.textContent = `${lastName ? lastName : ""} ${firstName ? firstName : ""}，`
}

getFileList()
