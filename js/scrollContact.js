document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('from2').addEventListener('click', function() {
    const target = document.getElementById('target2');
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1950;
    let start = null;

    function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
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


  const target = document.getElementById('target2');
  if (target) {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(target);
  }



});