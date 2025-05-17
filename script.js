// Quick Access Bar: Smooth Scroll & Active Link Highlight
document.addEventListener('DOMContentLoaded', function () {
  // Support multiple navs per page (e.g. backend, frontend, etc.)
  const allQuickNavs = document.querySelectorAll('.quick-access-nav');
  allQuickNavs.forEach(nav => {
    const navLinks = nav.querySelectorAll('.quick-access-link');
    const sections = Array.from(navLinks).map(link => {
      const id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    });

    function setActiveLink() {
      let index = sections.length - 1;
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section && window.scrollY + 120 < section.offsetTop) {
          index = i - 1;
          break;
        }
      }
      navLinks.forEach(link => link.classList.remove('active'));
      if (index >= 0) navLinks[index].classList.add('active');
      else navLinks[0].classList.add('active');
    }

    window.addEventListener('scroll', setActiveLink);
    setActiveLink();

    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          const offset = 90; // Adjust if header is sticky
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  });
});
