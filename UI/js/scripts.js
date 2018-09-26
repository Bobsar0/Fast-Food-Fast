//  Toggle between adding and removing 'responsiveNav' class
const icon = document.getElementsByClassName('icon');
icon[0].onclick = () => {
  const navbar = document.querySelector('nav');
  if (navbar.className === 'topNav' || navbar.className === 'topNav sticky') {
    navbar.className += ' responsiveNav';
  } else {
    navbar.className = 'topNav';
  }
};

// Sticky menu navbar
const menuNav = document.querySelector('nav#menuNav');
// Get the offset position of the menuNav
const sticky = menuNav.offsetTop;

window.onscroll = () => {
  // Add the sticky class to the menuNav when you reach its scroll position.
  if (window.pageYOffset >= sticky) {
    menuNav.classList.add('sticky');
  } else {
    // Remove "sticky" when you leave the scroll position
    menuNav.classList.remove('sticky');
  }
};
