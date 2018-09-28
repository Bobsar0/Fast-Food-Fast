//  Toggle between adding and removing 'responsiveNav' class
const icon = document.getElementsByClassName('icon');
icon[0].onclick = () => {
  const navbar = document.querySelector('nav');
  if (navbar.className === 'topNav' || navbar.className === 'topNav stickyNav') {
    navbar.className += ' responsiveNav';
  } else {
    navbar.className = 'topNav';
  }
};

// Add sticky menu navbar and footer
const nav = document.querySelector('nav');
const footer = document.querySelector('footer');
// Get the offset position of the menuNav
const stickyNav = nav.offsetTop;

window.onscroll = () => {
  // Add the sticky class to the menuNav when you reach its scroll position.
  if (window.pageYOffset >= stickyNav) {
    nav.classList.add('stickyNav');
    // Add a sticky footer
    footer.style.position = 'fixed';
  } else {
    // Remove "sticky" when you leave the scroll position
    nav.classList.remove('stickyNav');
    footer.style.position = 'relative';
  }
};
