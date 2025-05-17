// ===============================
// Quick Access Smooth Scroll & Active Link Highlight
// ===============================

document.addEventListener('DOMContentLoaded', function () {
  // For every Quick Access navigation bar on the page
  document.querySelectorAll('.quick-access-nav').forEach(nav => {
    const navLinks = nav.querySelectorAll('.quick-access-link');
    const sections = Array.from(navLinks).map(link => {
      const id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    });

    // Highlight the active link based on scroll position
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

    // Smooth scroll with offset, and DO NOT update the hash in the URL
    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();

          // Offset for sticky header; adjust as needed
          const offset = 90;
          const elementPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });

          // ---- DO NOT update the hash in the URL ----
          // If you want to update the hash after scrolling, add:
          // window.history.pushState(null, null, '#' + targetId);
          // But as requested, we are NOT updating the hash
        }
      });
    });
  });
});

// =========== END ===========
