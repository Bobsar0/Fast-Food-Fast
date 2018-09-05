function toggleNav(){
    var navbar = document.getElementById("nav");
    // var c = document.querySelector('ul')
    if (navbar.className === "navbar") {
        navbar.className += " responsiveNav";
    } else {
        navbar.className = "navbar";
    }
}

const formUser = document.querySelector('#signupForm');
const userName = document.querySelector('#userName');
const password1 = document.querySelector('#password');
const password2 = document.querySelector('#password2');
const signupBtn = document.querySelector('#signupBtn');

const nameErr = document.querySelector('#username-err');
const passwordErr = document.querySelector('#password-err');


//    listen for submit button click and validate passwords
formUser.addEventListener('submit', (e) => {
    const ok = validatePasswords();
    if (!ok) {
        e.preventDefault();
        return;
    }
});

function validatePasswords() {
    passwordErr.textContent = '';
    if (password1.value === '') {
        pErr.textContent = 'Please enter a password.';
        return false;
    }
    if (password1.value !== password2.value) {
        pErr.textContent = 'Your passwords did not match. Please re-enter your passwords.';
        password1.value = '';
        password2.value = '';
        return false;
    }
    return true;
};