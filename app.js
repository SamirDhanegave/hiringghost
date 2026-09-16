/**
 * Resume Match - Client-side Application Logic
 * Vanilla JavaScript implementation for high performance and zero external framework overhead.
 */

function initApp() {
  // --- DOM Elements ---
  const resumeInput = document.getElementById('resume-input');
  const jobInput = document.getElementById('job-input');
  const resumeCount = document.getElementById('resume-count');
  const jobCount = document.getElementById('job-count');
  const analyzeBtn = document.getElementById('analyze-btn');
  const analyzeBtnText = document.getElementById('analyze-btn-text');
  const analyzeBtnIcon = document.getElementById('analyze-btn-icon');
  const analyzeBtnSpinner = document.getElementById('analyze-btn-spinner');
  const sampleBtn = document.getElementById('sample-btn');
  const emptySampleBtn = document.getElementById('empty-sample-btn');
  const clearBtn = document.getElementById('clear-btn');
  const uploadResumeCta = document.getElementById('upload-resume-cta');

  // File Upload Elements - Resume
  const resumeUploadBtn = document.getElementById('resume-upload-btn');
  const resumeFileInput = document.getElementById('resume-file-input');
  const resumeCard = document.getElementById('resume-card');
  const resumeDropOverlay = document.getElementById('resume-drop-overlay');
  const resumeFileBadge = document.getElementById('resume-file-badge');
  const resumeFileName = document.getElementById('resume-file-name');
  const resumeFileStatus = document.getElementById('resume-file-status');
  const resumeFileRemove = document.getElementById('resume-file-remove');

  // File Upload Elements - Job Description
  const jobUploadBtn = document.getElementById('job-upload-btn');
  const jobFileInput = document.getElementById('job-file-input');
  const jobCard = document.getElementById('job-card');
  const jobDropOverlay = document.getElementById('job-drop-overlay');
  const jobFileBadge = document.getElementById('job-file-badge');
  const jobFileName = document.getElementById('job-file-name');
  const jobFileStatus = document.getElementById('job-file-status');
  const jobFileRemove = document.getElementById('job-file-remove');

  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const resultsSection = document.getElementById('results-section');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');

  // Result Elements
  const scoreNumber = document.getElementById('score-number');
  const scoreProgressBar = document.getElementById('score-progress-bar');
  const scoreInterpretation = document.getElementById('score-interpretation');
  const scoreBadge = document.getElementById('score-badge');
  const missingKeywordsList = document.getElementById('missing-keywords-list');
  const missingKeywordsEmpty = document.getElementById('missing-keywords-empty');
  const suggestionsList = document.getElementById('suggestions-list');
  const suggestionsEmpty = document.getElementById('suggestions-empty');

  // --- Sample Data ---
  const sampleResume = `Alex Morgan
alex.morgan@email.com | (555) 234-5678 | San Francisco, CA
Portfolio: alexmorgan.dev | GitHub: github.com/alexmorgan

SUMMARY
Frontend engineer with 3+ years of experience building modern web applications with JavaScript, HTML5, and CSS. Passionate about component systems, responsive user interfaces, and page performance.

EXPERIENCE
Frontend Developer | TechFlow Labs (2022 - Present)
- Built customer-facing web applications using JavaScript and CSS framework for 50,000 monthly visitors.
- Created reusable UI components to standardize internal dashboards across three engineering squads.
- Collaborated with product designers to convert Figma prototypes into functional web pages.
- Worked on page load performance by optimizing assets and code splitting.

Junior Web Developer | Nimbus Studio (2021 - 2022)
- Maintained client websites and resolved frontend bugs across mobile and desktop browsers.
- Wrote unit tests for client checkout flow modules using testing libraries.
- Participated in weekly sprint planning and code review sessions with senior engineers.

SKILLS & EDUCATION
- Languages & Tech: JavaScript (ES6+), HTML5, CSS3, Sass, Git, Webpack, Responsive Design
- Education: B.S. in Computer Science, State University (2021)`;

  const sampleJobDescription = `Senior Frontend Engineer | Horizon Software

About the Role:
We are looking for a Senior Frontend Engineer to lead development of our flagship SaaS workflow platform. You will collaborate with product designers, backend engineers, and cross-functional teams to build fast, intuitive, and accessible user interfaces.

Key Responsibilities:
- Build and maintain high-performance web applications using React, TypeScript, and Tailwind CSS.
- Architect robust frontend data layers interacting with REST APIs and GraphQL endpoints.
- Write comprehensive automated tests including unit testing (Jest/Vitest) and end-to-end tests (Playwright).
- Champion web accessibility standards (WCAG 2.1 AA) and responsive web design across devices.
- Partner with backend engineers on API contracts and CI/CD deployment pipelines.
- Mentor junior engineers and participate in architecture discussions.

Qualifications:
- 3+ years experience building modern web applications with React and TypeScript.
- Strong proficiency with RESTful APIs, asynchronous programming, and state management.
- Demonstrated experience with modern automated unit testing and CI/CD workflows.
- Deep understanding of browser performance profiling, web vitals, and accessibility (WCAG).
- Experience with Git version control and Agile software methodologies.`;

  // --- Helper Functions ---
  function updateCounts() {
    const resumeText = resumeInput.value.trim();
    const jobText = jobInput.value.trim();

    // Word counts
    const resumeWords = resumeText ? resumeText.split(/\s+/).length : 0;
    const jobWords = jobText ? jobText.split(/\s+/).length : 0;

    resumeCount.textContent = `${resumeWords} ${resumeWords === 1 ? 'word' : 'words'} · ${resumeInput.value.length} chars`;
    jobCount.textContent = `${jobWords} ${jobWords === 1 ? 'word' : 'words'} · ${jobInput.value.length} chars`;

    // Button states
    const hasBoth = resumeText.length > 0 && jobText.length > 0;
    const hasAny = resumeInput.value.length > 0 || jobInput.value.length > 0;

    analyzeBtn.disabled = !hasBoth;
    clearBtn.classList.toggle('hidden', !hasAny);
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove('hidden');
    errorBanner.setAttribute('aria-hidden', 'false');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
    errorBanner.setAttribute('aria-hidden', 'true');
  }

  function setLoading(isLoading) {
    if (isLoading) {
      analyzeBtn.disabled = true;
      analyzeBtnText.textContent = 'Analyzing match...';
      analyzeBtnIcon.classList.add('hidden');
      analyzeBtnSpinner.classList.remove('hidden');

      emptyState.classList.add('hidden');
      resultsSection.classList.add('hidden');
      loadingState.classList.remove('hidden');
      hideError();
    } else {
      analyzeBtn.disabled = !(resumeInput.value.trim() && jobInput.value.trim());
      analyzeBtnText.textContent = 'Analyze my resume';
      analyzeBtnIcon.classList.remove('hidden');
      analyzeBtnSpinner.classList.add('hidden');
      loadingState.classList.add('hidden');
    }
  }

  // Animated Count-Up for Match Score
  function animateScore(targetScore) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      scoreNumber.textContent = `${targetScore}%`;
      scoreProgressBar.style.width = `${targetScore}%`;
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    scoreProgressBar.style.width = '0%';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(easeProgress * targetScore);

      scoreNumber.textContent = `${currentScore}%`;
      scoreProgressBar.style.width = `${easeProgress * targetScore}%`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        scoreNumber.textContent = `${targetScore}%`;
        scoreProgressBar.style.width = `${targetScore}%`;
      }
    }

    requestAnimationFrame(update);
  }

  // Get score interpretation text and badge style
  function getScoreInterpretation(score) {
    if (score < 40) {
      return {
        badge: 'Low Alignment',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        barColorClass: 'bg-amber-500',
        text: 'Significant alignment gaps. Consider tailoring your resume with relevant skills and terminology from the job post.',
      };
    } else if (score < 70) {
      return {
        badge: 'Moderate Alignment',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        barColorClass: 'bg-blue-600',
        text: 'Some relevant experience and skills are present, with several key qualifications not yet highlighted.',
      };
    } else if (score < 85) {
      return {
        badge: 'Strong Alignment',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        barColorClass: 'bg-emerald-600',
        text: 'Strong alignment with the job description. Minor refinements to keywords and phrasing will elevate your fit.',
      };
    } else {
      return {
        badge: 'High Alignment',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        barColorClass: 'bg-emerald-600',
        text: 'High textual alignment with the job description. Your skills and background closely match the posting requirements.',
      };
    }
  }

  // Render Missing Keyword Chips safely
  function renderMissingKeywords(keywords) {
    missingKeywordsList.innerHTML = '';

    if (!keywords || keywords.length === 0) {
      missingKeywordsEmpty.classList.remove('hidden');
      return;
    }

    missingKeywordsEmpty.classList.add('hidden');

    keywords.forEach((keyword) => {
      const chip = document.createElement('span');
      chip.className = 'inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200 shadow-2xs hover:bg-stone-200/70 transition-colors select-all';
      chip.textContent = keyword;
      missingKeywordsList.appendChild(chip);
    });
  }

  // Render Suggested Bullet Rewrites safely
  function renderSuggestions(suggestions) {
    suggestionsList.innerHTML = '';

    if (!suggestions || suggestions.length === 0) {
      suggestionsEmpty.classList.remove('hidden');
      return;
    }

    suggestionsEmpty.classList.add('hidden');

    suggestions.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'p-5 sm:p-6 bg-white border border-stone-200 rounded-xl shadow-xs space-y-4 hover:border-stone-300 transition-colors';

      // Header row with numbered badge and copy button
      const headerRow = document.createElement('div');
      headerRow.className = 'flex items-center justify-between gap-3 border-b border-stone-100 pb-3';

      const label = document.createElement('span');
      label.className = 'text-xs font-semibold uppercase tracking-wider text-stone-500';
      label.textContent = `Suggestion 0${index + 1}`;

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500';
      copyBtn.setAttribute('aria-label', `Copy suggested rewrite ${index + 1}`);

      // Copy icon SVG
      copyBtn.innerHTML = `
        <svg class="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <span class="copy-text">Copy rewrite</span>
      `;

      copyBtn.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(item.rewrite);
          } else {
            // Fallback for older browsers / iframe restrictions
            const textarea = document.createElement('textarea');
            textarea.value = item.rewrite;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          }

          // UI feedback
          copyBtn.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
          copyBtn.innerHTML = `
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="copy-text font-medium">Copied!</span>
          `;

          setTimeout(() => {
            copyBtn.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
            copyBtn.innerHTML = `
              <svg class="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span class="copy-text">Copy rewrite</span>
            `;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
      });

      headerRow.appendChild(label);
      headerRow.appendChild(copyBtn);
      card.appendChild(headerRow);

      // Original bullet section
      if (item.original) {
        const origBox = document.createElement('div');
        origBox.className = 'space-y-1';
        const origLabel = document.createElement('div');
        origLabel.className = 'text-xs font-semibold text-stone-500 uppercase tracking-wider';
        origLabel.textContent = 'Original bullet';
        const origText = document.createElement('p');
        origText.className = 'text-sm text-stone-600 bg-stone-50/80 px-3 py-2 rounded-lg border border-stone-150 leading-relaxed font-sans';
        origText.textContent = item.original;

        origBox.appendChild(origLabel);
        origBox.appendChild(origText);
        card.appendChild(origBox);
      }

      // Suggested rewrite section
      const rewriteBox = document.createElement('div');
      rewriteBox.className = 'space-y-1';
      const rewriteLabel = document.createElement('div');
      rewriteLabel.className = 'text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5';
      rewriteLabel.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        Suggested rewrite
      `;
      const rewriteText = document.createElement('p');
      rewriteText.className = 'text-sm sm:text-base font-medium text-stone-900 bg-blue-50/40 p-3.5 rounded-lg border border-blue-100 leading-relaxed';
      rewriteText.textContent = item.rewrite;

      rewriteBox.appendChild(rewriteLabel);
      rewriteBox.appendChild(rewriteText);
      card.appendChild(rewriteBox);

      // Why this helps
      if (item.reason) {
        const reasonBox = document.createElement('div');
        reasonBox.className = 'flex items-start gap-2 pt-1';
        reasonBox.innerHTML = `
          <svg class="w-4 h-4 text-stone-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        `;
        const reasonText = document.createElement('p');
        reasonText.className = 'text-xs text-stone-500 leading-relaxed';
        const reasonStrong = document.createElement('span');
        reasonStrong.className = 'font-semibold text-stone-700';
        reasonStrong.textContent = 'Why this helps: ';
        reasonText.appendChild(reasonStrong);
        reasonText.appendChild(document.createTextNode(item.reason));

        reasonBox.appendChild(reasonText);
        card.appendChild(reasonBox);
      }

      suggestionsList.appendChild(card);
    });
  }

  // --- Main Analyze Handler ---
  async function handleAnalyze() {
    const resume = resumeInput.value.trim();
    const jobDescription = jobInput.value.trim();

    hideError();

    if (!resume || !jobDescription) {
      showError('Paste your resume and job description to get started.');
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobDescription,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const err = data?.error || "We couldn't analyze that right now. Please try again.";
        showError(err);
        setLoading(false);
        return;
      }

      if (!data || typeof data.score !== 'number') {
        showError("We received an unexpected response format. Please try again.");
        setLoading(false);
        return;
      }

      // Success: render results
      const score = Math.max(0, Math.min(100, Math.round(data.score)));
      const interpretation = getScoreInterpretation(score);

      // Score block updates
      scoreBadge.textContent = interpretation.badge;
      scoreBadge.className = `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${interpretation.badgeClass}`;
      scoreProgressBar.className = `h-full rounded-full transition-all duration-700 ease-out ${interpretation.barColorClass}`;
      scoreInterpretation.textContent = interpretation.text;

      animateScore(score);

      // Missing keywords
      renderMissingKeywords(data.missingKeywords || []);

      // Suggestions
      renderSuggestions(data.suggestions || []);

      // Reveal results
      emptyState.classList.add('hidden');
      resultsSection.classList.remove('hidden');

      // Scroll smoothly to results
      setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      if (err.name === 'AbortError') {
        showError('The analysis took too long. Please try again.');
      } else {
        showError("The service is temporarily unavailable or network connection was lost. Please try again.");
      }
      console.error('Analysis request error:', err);
    } finally {
      setLoading(false);
    }
  }

  // --- File Upload & Text Extraction ---
  function formatFileSize(bytes) {
    if (!bytes || bytes < 1024) return `${bytes || 0} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function extractTextFromFile(file) {
    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    // 1. PDF extraction
    if (fileName.endsWith('.pdf')) {
      if (!window.pdfjsLib) {
        throw new Error('PDF reader is initializing. Please wait a few seconds and try again.');
      }
      try {
        const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        let textParts = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageStrings = content.items
            .filter((item) => item && typeof item.str === 'string')
            .map((item) => item.str);
          
          if (pageStrings.length > 0) {
            textParts.push(pageStrings.join(' '));
          }
        }

        const fullText = textParts.join('\n\n').trim();
        if (!fullText) {
          throw new Error('This PDF appears to be a scanned image without selectable text. Please paste the text directly.');
        }
        return fullText;
      } catch (pdfErr) {
        if (pdfErr.message && pdfErr.message.includes('scanned')) {
          throw pdfErr;
        }
        throw new Error('Could not read PDF contents. The file may be password protected or corrupted.');
      }
    }

    // 2. Word document (.docx) extraction
    if (fileName.endsWith('.docx')) {
      if (!window.mammoth) {
        throw new Error('Word document reader is initializing. Please wait a moment and try again.');
      }
      try {
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        const text = (result && result.value) ? result.value.trim() : '';
        if (!text) {
          throw new Error('No readable text found in this Word document.');
        }
        return text;
      } catch (docErr) {
        throw new Error('Failed to parse .docx file. Please check that the file is not corrupted.');
      }
    }

    // 3. Legacy Word document (.doc) extraction
    if (fileName.endsWith('.doc')) {
      if (window.mammoth) {
        try {
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          if (result && result.value && result.value.trim().length > 30) {
            return result.value.trim();
          }
        } catch (e) {
          // Fall through to error
        }
      }
      throw new Error('Legacy .doc binary format cannot be fully extracted in-browser. Please save as .docx or .pdf, or copy and paste the text directly.');
    }

    // 4. Plain text / Markdown / RTF
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.rtf') || file.type.startsWith('text/')) {
      const text = await file.text();
      if (!text.trim()) {
        throw new Error('The text file is empty.');
      }
      return text.trim();
    }

    throw new Error('Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text file (.txt).');
  }

  async function handleFileUpload(file, targetType) {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showError('File is too large. Please upload a document smaller than 15 MB.');
      return;
    }

    const isResume = targetType === 'resume';
    const inputEl = isResume ? resumeInput : jobInput;
    const badgeEl = isResume ? resumeFileBadge : jobFileBadge;
    const nameEl = isResume ? resumeFileName : jobFileName;
    const statusEl = isResume ? resumeFileStatus : jobFileStatus;

    // Show initial extracting state
    nameEl.textContent = file.name;
    statusEl.textContent = 'Extracting text...';
    statusEl.className = 'text-blue-600 font-medium shrink-0 animate-pulse';
    badgeEl.classList.remove('hidden');
    hideError();

    try {
      const extractedText = await extractTextFromFile(file);
      inputEl.value = extractedText;
      updateCounts();

      statusEl.textContent = `Extracted · ${formatFileSize(file.size)}`;
      statusEl.className = 'text-emerald-700 font-medium shrink-0';

      // Subtle pulse to confirm success
      inputEl.classList.add('ring-2', 'ring-emerald-400');
      setTimeout(() => {
        inputEl.classList.remove('ring-2', 'ring-emerald-400');
      }, 900);

    } catch (err) {
      console.error('File extraction failed:', err);
      statusEl.textContent = 'Extraction failed';
      statusEl.className = 'text-rose-600 font-medium shrink-0';
      showError(err.message || 'Failed to extract text from file.');
    }
  }

  // Set up Drag & Drop for a card container
  function setupDragAndDrop(cardEl, dropOverlayEl, targetType) {
    let dragCounter = 0;

    cardEl.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      cardEl.classList.add('dragover');
      dropOverlayEl.classList.remove('hidden');
    });

    cardEl.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    cardEl.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        cardEl.classList.remove('dragover');
        dropOverlayEl.classList.add('hidden');
      }
    });

    cardEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      cardEl.classList.remove('dragover');
      dropOverlayEl.classList.add('hidden');

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFileUpload(file, targetType);
      }
    });
  }

  // Initialize drag and drop
  setupDragAndDrop(resumeCard, resumeDropOverlay, 'resume');
  setupDragAndDrop(jobCard, jobDropOverlay, 'job');

  // Resume upload button & input
  resumeUploadBtn.addEventListener('click', () => {
    resumeFileInput.click();
  });

  resumeFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0], 'resume');
    }
  });

  resumeFileRemove.addEventListener('click', () => {
    resumeFileInput.value = '';
    resumeFileBadge.classList.add('hidden');
  });

  // Job description upload button & input
  jobUploadBtn.addEventListener('click', () => {
    jobFileInput.click();
  });

  jobFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0], 'job');
    }
  });

  jobFileRemove.addEventListener('click', () => {
    jobFileInput.value = '';
    jobFileBadge.classList.add('hidden');
  });

  // Action Bar CTA upload button
  if (uploadResumeCta) {
    uploadResumeCta.addEventListener('click', () => {
      resumeFileInput.click();
    });
  }

  // --- Event Listeners ---
  resumeInput.addEventListener('input', updateCounts);
  jobInput.addEventListener('input', updateCounts);

  analyzeBtn.addEventListener('click', handleAnalyze);

  function loadSampleData() {
    // Clear any previous file badges/inputs
    if (resumeFileInput) resumeFileInput.value = '';
    if (jobFileInput) jobFileInput.value = '';
    if (resumeFileBadge) resumeFileBadge.classList.add('hidden');
    if (jobFileBadge) jobFileBadge.classList.add('hidden');

    // Populate the textareas
    resumeInput.value = sampleResume;
    jobInput.value = sampleJobDescription;
    updateCounts();
    hideError();

    // Visual button feedback
    if (sampleBtn) {
      sampleBtn.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50');
      setTimeout(() => {
        sampleBtn.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
      }, 700);
    }

    // Immediately trigger analysis so the user sees the complete sample analysis results
    handleAnalyze();
  }

  // Expose globally for resilient access
  window.loadSampleData = loadSampleData;

  if (sampleBtn) {
    sampleBtn.addEventListener('click', loadSampleData);
  }

  if (emptySampleBtn) {
    emptySampleBtn.addEventListener('click', loadSampleData);
  }

  clearBtn.addEventListener('click', () => {
    resumeInput.value = '';
    jobInput.value = '';
    resumeFileInput.value = '';
    jobFileInput.value = '';
    resumeFileBadge.classList.add('hidden');
    jobFileBadge.classList.add('hidden');
    updateCounts();
    hideError();
    resultsSection.classList.add('hidden');
    emptyState.classList.remove('hidden');
  });

  // Initial count update
  updateCounts();
}

// Guarantee execution whether DOM is already interactive/complete or still loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
