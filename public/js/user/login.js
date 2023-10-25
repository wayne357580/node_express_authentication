/* --- 登入方法頁面切換 --- */
let goOtherLoginBtn = document.getElementById('goOtherLoginBtn')
let goBasicLoginBtn = document.getElementById('goBasicLoginBtn')
let basicLoginPage = document.getElementById('basicLoginPage')
let otherLoginPage = document.getElementById('otherLoginPage')
goBasicLoginBtn.addEventListener('click', (e) => {
    basicLoginPage.classList.remove("d-none")
    otherLoginPage.classList.add("d-none")
})

goOtherLoginBtn.addEventListener('click', (e) => {
    basicLoginPage.classList.add("d-none")
    otherLoginPage.classList.remove("d-none")
})
/* --- end --- */

/* --- 一般登入 --- */
let loginBtn = document.getElementById('loginBtn')
let googleLoginBtn = document.getElementById('googleLoginBtn')
let discordLoginBtn = document.getElementById('discordLoginBtn')
let githubLoginBtn = document.getElementById('githubLoginBtn')
let twitchLoginBtn = document.getElementById('twitchLoginBtn')
let signupBtn = document.getElementById('signupBtn')
let loginAct = document.getElementById('loginAct')
let loginPwd = document.getElementById('loginPwd')
let infoDiv = document.getElementById('infoDiv')

signupBtn.addEventListener('click', (e) => {
    window.location.href = '/signup'
})

document.querySelectorAll('input').forEach(e => {
    e.addEventListener('input', (e) => {
        infoDiv.classList.add('d-none')
        loginAct.classList.remove('is-invalid')
        loginPwd.classList.remove('is-invalid')
    })
})

loginBtn.addEventListener('click', (e) => {
    if (!loginAct.value) {
        loginAct.classList.add('is-invalid')
    } else if (!loginPwd.value) {
        loginPwd.classList.add('is-invalid')
    } else {
        fetch('/user/local/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account: loginAct.value,
                password: loginPwd.value
            })
        }).then(async (res) => {
            if (res.redirected) {
                alert('歡迎登入！')
                window.location.href = res.url
            } else {
                let resp = await res.json()
                infoDiv.classList.remove('d-none')
                infoDiv.textContent = resp.message
            }
        }).catch(e => {
            console.log(e)
            alert(e.message)
        })
    }
})


