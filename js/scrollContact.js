document.addEventListener('DOMContentLoaded', function() {
  const contact = document.getElementById('from2');
  const target2 = document.getElementById('target2');
  if (contact && target2) {
    contact.addEventListener('click', function() {
      const targetPosition = target2.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 2000;
      let start = null;

      function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = easeInOut(progress);
        window.scrollTo(0, startPosition + distance * ease);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    });
  }
});