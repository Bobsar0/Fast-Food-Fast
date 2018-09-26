// Toggle between adding and removing the "responsiveNav" class to nav when user clicks on the icon
function toggleNav() {
  const navbar = document.querySelector('nav');
  if (navbar.className === 'topNav') {
    navbar.className += ' responsiveNav';
  } else {
    navbar.className = 'topNav';
  }
}
