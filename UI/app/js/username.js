document.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem('username');
  const me = document.getElementsByClassName('me');
  me[0].innerHTML = `<i class="fa fa-user fa-1x" aria-hidden="true"></i>${name}`;
  me[1].textContent = name;
});
