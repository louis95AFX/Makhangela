document.addEventListener('DOMContentLoaded', () => {
  const gradeSelect = document.getElementById('grade');
  const subjectsInput = document.getElementById('subjects');
  const totalFeeElement = document.getElementById('total-fee');
  const discountNoteElement = document.querySelector('.discount-note');

  // Base monthly fees
  const fees = {
    '8-9': 700,
    '10-11': 750,
    '12': 800
  };

  const discountRate = 0.10; // 10%

  // Format price as R 0,000.00
  const formatCurrency = (amount) =>
    `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  function calculateFee() {
    const selectedGrade = gradeSelect.value;
    let numberOfSubjects = parseInt(subjectsInput.value) || 1;

    // Clamp subjects between 1–3
    numberOfSubjects = Math.min(Math.max(numberOfSubjects, 1), 3);
    subjectsInput.value = numberOfSubjects;

    const baseFee = fees[selectedGrade];
    const rawTotal = baseFee * numberOfSubjects;
    let finalFee = rawTotal;

    // Apply 10% discount for 2+ subjects
    if (numberOfSubjects >= 2) {
      const discountAmount = rawTotal * discountRate;
      finalFee = rawTotal - discountAmount;

      discountNoteElement.textContent = `🎉 10% Multi-Subject Discount Applied! You saved ${formatCurrency(discountAmount)}.`;
      discountNoteElement.classList.add('active');

      // Add a small animation when discount appears
      discountNoteElement.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
        { duration: 600, easing: 'ease-out' }
      );
    } else {
      discountNoteElement.textContent = '';
      discountNoteElement.classList.remove('active');
    }

    // Animate fee number smoothly
    const oldFee = parseFloat(totalFeeElement.dataset.value || 0);
    const newFee = finalFee;
    const duration = 400;
    const startTime = performance.now();

    function animateFee(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const interpolated = oldFee + (newFee - oldFee) * progress;
      totalFeeElement.textContent = formatCurrency(interpolated);
      totalFeeElement.dataset.value = interpolated;

      if (progress < 1) requestAnimationFrame(animateFee);
    }
    requestAnimationFrame(animateFee);
  }

  // Event listeners
  gradeSelect.addEventListener('change', calculateFee);
  subjectsInput.addEventListener('input', calculateFee);

  // Initial calculation
  calculateFee();
});
