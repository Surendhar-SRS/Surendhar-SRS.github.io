document.addEventListener('DOMContentLoaded', function () {
  const allQuickNavs = document.querySelectorAll('.quick-access-nav');
  allQuickNavs.forEach(nav => {
    const navLinks = nav.querySelectorAll('.quick-access-link');
    const sections = Array.from(navLinks).map(link => {
      const id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          const offset = 90; // adjust for header height if needed
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  });
});
