// --- 1. CONFIGURATION ---
const SUPABASE_URL = 'https://vzumdblygtxomnxwuhul.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dW1kYmx5Z3R4b21ueHd1aHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDU5NjgsImV4cCI6MjA3ODcyMTk2OH0.au1p4k4bPap5Ha1bU15kTQfkLrIqs02xFtJbQaFH1F0';

const TABLE_NAME = 'updates';
const BUCKET_NAME = 'media';

// --- 2. INITIALIZATION ---
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('updateForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('status-message');

// Utility Message Function
function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = isError ? 'error' : 'success';
  statusMessage.style.display = 'block';
}

// --- Upload file to Supabase Bucket ---
async function uploadFile(file) {
  const ext = file.name.split('.').pop();
  const filePath = `public/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  setStatus(`Uploading file: ${file.name}...`);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) {
    setStatus(`File upload failed: ${error.message}`, true);
    console.error('File upload error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// --- 3. SUBMIT HANDLER ---
async function handleSubmit(event) {
  event.preventDefault();

  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Submitting...';
  statusMessage.style.display = 'none';

  const formData = new FormData(form);
  const uploadedFile = document.getElementById('mediaFile').files[0];

  let finalMediaUrl = formData.get('MediaURL')?.trim();

  // Handle file upload
  if (uploadedFile) {
    const fileUrl = await uploadFile(uploadedFile);
    if (!fileUrl) {
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="fas fa-paper-plane"></i> Submit Update';
      return;
    }
    finalMediaUrl = fileUrl;
  }

  // EXACT column names from your table:
  const dataToInsert = {
    Title: formData.get('Title'),
    Date: formData.get('Date'),
    Category: formData.get('Category'),
    Content: formData.get('Content'),
    MediaURL: finalMediaUrl || null
  };

  setStatus('Saving form data to database...');

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([dataToInsert])
    .select();

  console.log('Supabase Insert Response:', data, error);

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Update';

  if (error) {
    setStatus(`Database insertion failed: ${error.message}`, true);
    return;
  }

  if (data && data.length > 0) {
    setStatus('Update submitted successfully!');
    form.reset();
  } else {
    setStatus(
      'No rows inserted. Check RLS policies or table permissions.',
      true
    );
  }
}

// --- 4. EVENT LISTENER ---
form.addEventListener('submit', handleSubmit);
