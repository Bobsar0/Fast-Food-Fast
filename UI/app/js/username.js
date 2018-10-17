document.addEventListener('DOMContentLoaded', () => {
  const meArr = document.getElementsByClassName('me');
  const name = localStorage.getItem('username');
  if (name) {
    meArr[0].innerHTML = `<i class="fa fa-user fa-1x" aria-hidden="true"></i>${name}`;
    if (meArr.length > 1) {
      [...meArr].slice(1).forEach((me) => {
        me.textContent = name;
      });
    }
  } else {
    window.location.href = '../../templates/menu.html';
  }
});
