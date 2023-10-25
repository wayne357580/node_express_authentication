
let userForm = document.getElementById("userForm");
userForm.addEventListener('submit', (e) => {
    // 移除預設行動
    e.preventDefault();
    // 取得資料
    let name = document.getElementById("name");
    let age = document.getElementById("age");
    let gender = document.getElementById("gender");

    if (!name?.value) {
        alert('請輸入名字')
    } else if (!age?.value) {
        alert('請輸入年齡')
    } else if (!gender?.value) {
        alert('請輸入性別')
    } else {
        // 送出資料
        fetch(`/hello/${name.value}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                age: age.value,
                gender: gender.value
            })
        }).then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json()
        }).then(data => {
            const { status, message } = data
            alert(`Request status：${status}\n${message}`)
        })
    }
})