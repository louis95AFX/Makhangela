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

document.addEventListener('DOMContentLoaded', async () => {
  // ============================
  // Supabase Configuration
  // ============================
  const SUPABASE_URL = "https://vzumdblygtxomnxwuhul.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dW1kYmx5Z3R4b21ueHd1aHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDU5NjgsImV4cCI6MjA3ODcyMTk2OH0.au1p4k4bPap5Ha1bU15kTQfkLrIqs02xFtJbQaFH1F0";

  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function loadUpdates() {
    try {
      const { data, error } = await db
        .from("updates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const container = document.getElementById("updates");
      container.innerHTML = "";

      data.forEach((post, index) => {
        const media = post.MediaURL
          ? post.MediaURL.endsWith(".mp4") || post.MediaURL.endsWith(".mov")
            ? `<video controls class="w-full h-48 object-cover rounded-lg shadow-md mb-4" src="${post.MediaURL}"></video>`
            : `<img class="w-full h-48 object-cover rounded-lg shadow-md mb-4" src="${post.MediaURL}" alt="Post Media">`
          : "";

        const postElement = document.createElement('div');
        postElement.className = 'post bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300';
        postElement.innerHTML = `
          <div class="p-6">
            <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(post.Category)} mb-3">
              ${post.Category || "General"}
            </span>
            <h2 class="text-xl font-bold text-gray-800 mb-2">${post.Title}</h2>
            <p class="text-sm text-gray-500 mb-3 flex items-center">
              <i data-feather="calendar" class="mr-2 w-4 h-4"></i>
              ${post.Date}
            </p>
            <p class="text-gray-600 mb-4">${post.Content}</p>
            ${media}
          </div>
        `;
        container.appendChild(postElement);
      });

      feather.replace();
    } catch (error) {
      console.error("Fetch Error:", error);
      document.getElementById('updates').innerHTML = `
        <div class="col-span-full text-center py-12">
          <i data-feather="alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4"></i>
          <h3 class="text-xl font-medium text-gray-700">Failed to load updates</h3>
          <p class="text-gray-500 mt-2">Please check your internet connection and try again</p>
        </div>
      `;
      feather.replace();
    }
  }
  function getCategoryColor(category) {
    const colors = {
      'Event': 'bg-blue-100 text-blue-800',
      'News': 'bg-indigo-100 text-indigo-800',
      'Announcement': 'bg-amber-100 text-amber-800',
      'Academic': 'bg-emerald-100 text-emerald-800',
      'Sports': 'bg-rose-100 text-rose-800',
      'Workshop': 'bg-violet-100 text-violet-800'
    };
return colors[category] || 'bg-gray-100 text-gray-800';
  }

  loadUpdates();
});