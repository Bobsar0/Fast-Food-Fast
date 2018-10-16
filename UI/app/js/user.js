// IMPLEMENT SIGNUP
const signupBtn = document.getElementById('signupBtn');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

const usernameErr = document.querySelector('div#usernameErr');
const emailErr = document.querySelector('div#emailErr');
const passwordErr = document.querySelector('div#passwordErr');
const password2Err = document.querySelector('div#password2Err');

// let msg = '';

// function appendErrMsg(errDiv, errMsg) {
//   const para = document.createElement('P');
//   para.innerText = errMsg;
//   errDiv.appendChild(para);
//   console.log('errdiv:', errDiv);
// }


/**
 * isValidPassword method
 * @param {string} password
 * @returns {string} true or error messages
 */
// Adapted from https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
function isValidPassword(value) {
  if (!/[a-z]/.test(value)) {
    return 'Your password must contain at least one lowercase letter';
  } if (!/[A-Z]/.test(value)) {
    return 'Your password must contain at least one uppercase letter';
  } if (!/\d/.test(value)) {
    return 'Your password must contain at least one number';
  } if (!/[@$!%*?&]/.test(value)) {
    return 'Your password must contain at least one of these special characters: @, $, !, %, *, ?, &';
  } if (value.length < 6) {
    return 'Your password must be composed of at least 6 characters';
  }
  return 'true';
}

email.onchange = () => {
  emailErr.innerHTML = /\S+@\S+\.\S+/.test(email.value) ? '' : 'Please enter a valid email';
};
password.onchange = () => {
  passwordErr.innerHTML = isValidPassword(password.value) === 'true' ? '' : isValidPassword(password.value);
  password2Err.innerHTML = password2.value === password.value ? '' : 'Passwords don\'t match';
};
password2.oninput = () => {
  password2Err.innerHTML = password2.value === password.value ? '' : 'Passwords don\'t match';
};

const localhost = 'http://localhost:9999/api/v1';
// COMMENT ABOVE AND UNCOMMENT BELOW FOR HEROKU
// const herokuhost = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';
signupBtn.onclick = () => {
  if (emailErr.innerHTML !== '' || passwordErr.innerHTML !== '' || password2Err.innerHTML !== '') {
    usernameErr.innerHTML = 'Please correct the browser errors in red below';
  } else {
    const username = document.getElementById('username').value;
    usernameErr.innerHTML = '';
    const req = new Request(`${localhost}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // mode: 'no-cors',
      body: JSON.stringify({ username, email: email.value, password: password.value }),
    });
    console.log('req:', req);

    fetch(req).then(resp => resp.json().then((res) => {
      console.log('SUCCESSFUL:', res);
      if (res.status === 'fail') {
        password2Err.innerHTML = res.message;
      }
      if (res.status === 'success' && res.token) {
        password2Err.innerHTML = `<span style='color: green'>${res.message}</span>`;
        setTimeout(() => {
          window.location.href = '../../templates/menu.html';
        }, 2000);
      }
    })
      .catch((err) => {
        console.log('error in signup:', err);
        password2Err.innerHTML = err.message;
      }))
      .catch(((fetchErr) => {
        console.log('error in fetching api:', fetchErr);
        usernameErr.innerHTML = fetchErr;
      }));
  }
};
