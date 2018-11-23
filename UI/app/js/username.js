document.addEventListener('DOMContentLoaded', () => {
  const meArr = document.getElementsByClassName('me');
  const name = localStorage.getItem('username');
  if (name) {
    meArr[0].innerHTML = `<i class="fa fa-user fa-1x" style="padding: 0;" aria-hidden="true"></i> ${name}`;
    if (meArr.length > 1) {
      [...meArr].slice(1).forEach((me) => {
        me.textContent = name;
      });
    }
  }
  const content = document.getElementsByClassName('dropdown-content')[1];

  if (localStorage.getItem(name) && localStorage.getItem(name) === 'an') {
    content.innerHTML = '<a href="admin">Admin Dashboard</a><a href="history">Order History</a>';
  } else {
    content.innerHTML = '<a href="history">Order History</a>';
  }
});

// IMPLEMENT LOGOUT
const logout = document.getElementById('logout');
logout.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login';
});
