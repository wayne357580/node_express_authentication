const signupBtn = document.getElementById('signupBtn')
const singupForm = document.getElementById('singupForm')
const lastName = document.getElementById('lastName')
const firstName = document.getElementById('firstName')
const account = document.getElementById('account')
const password = document.getElementById('password')
const repeatPassword = document.getElementById('repeatPassword')
const birthDate = document.getElementById('birthDate')
const email = document.getElementById('email')
const infoDiv = document.getElementById('infoDiv')

singupForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!account.value) {
        account.classList.add('is-invalid')
    } else if (!password.value) {
        password.classList.add('is-invalid')
    } else if (password.value != repeatPassword.value) {
        repeatPassword.classList.add('is-invalid')
    } else {
        let userData = {
            account: account.value,
            password: password.value
        }
        if (lastName) userData['lastName'] = lastName.value
        if (firstName) userData['firstName'] = firstName.value
        if (birthDate) userData['birthDate'] = birthDate.value
        if (email) userData['email'] = email.value

        fetch('/user/local/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        }).then(async (res) => {
            if (res.redirected) {
                alert('註冊成功！請等待管理員開通帳號')
                window.location.href = res.url
                console.log(res)
            } else {
                console.log(res)
                let resp = await res.json()
                infoDiv.style['display'] = 'block'
                infoDiv.textContent = resp.message
            }
        }).catch(e => {
            console.log(e)
            alert(e.message || 'Server error')
        })
    }
});

account.addEventListener('input', (e) => {
    account.classList.remove('is-invalid')
})

password.addEventListener('input', (e) => {
    password.classList.remove('is-invalid')
})

repeatPassword.addEventListener('input', (e) => {
    repeatPassword.classList.remove('is-invalid')
})

document.querySelectorAll('input').forEach(e => {
    e.addEventListener('input', (e) => {
        infoDiv.style['display'] = 'none'
    })
})


