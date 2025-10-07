document.addEventListener('DOMContentLoaded', function() {
  const back = document.getElementById('from3');
  function getTarget() {
    // Use matchMedia to check if screen is small
    if (window.matchMedia('(max-width: 639px)').matches) {
      return document.getElementById('target3-img');
    } else {
      return document.getElementById('target3-canvas');
    }
  }
  if (back) {
    back.addEventListener('click', function() {
      const target = getTarget();
      if (!target) return;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
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