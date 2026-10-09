
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const resumeInput = $("resume-input");
  const jobInput = $("job-input");
  const analyzeBtn = $("analyze-btn");

  if (!resumeInput || !jobInput || !analyzeBtn) {
    console.error(
      "Hiring Ghost: Required HTML elements were not found. Check your element IDs."
    );
    return;
  }

  const sampleResume = `Samir Dhanegave
BCA Student | Junior Software Developer

Skills: Python, JavaScript, HTML, CSS, Git, GitHub, SQL.

Projects:
- Built responsive web pages using HTML, CSS and JavaScript.
- Managed project code using Git and GitHub.
- Deployed personal projects using Vercel.

Education: Bachelor of Computer Applications (BCA).`;

  const sampleJob = `Junior Software Developer

Responsibilities:
- Build responsive web applications.
- Write clean JavaScript and Python code.
- Work with REST APIs, SQL databases, Git and GitHub.
- Debug issues and test application features.

Requirements:
- HTML, CSS, JavaScript and Python.
- REST API and SQL knowledge.
- Problem-solving and communication skills.`;

  const countWords = (text) =>
    (text.trim().match(/\S+/g) || []).length;

  function showError(message) {
    const banner = $("error-banner");
    const messageEl = $("error-message");

    if (banner && messageEl) {
      messageEl.textContent = message;
      banner.classList.remove("hidden");
    } else {
      alert(message);
    }
  }

  function clearError() {
    $("error-banner")?.classList.add("hidden");

    if ($("error-message")) {
      $("error-message").textContent = "";
    }
  }

  function updateCounter(type) {
    const input = type === "resume" ? resumeInput : jobInput;
    const counter = $(type + "-count");

    if (counter) {
      counter.textContent =
        `${countWords(input.value)} words · ${input.value.length} chars`;
    }
  }

  function updateButtons() {
    analyzeBtn.disabled =
      !resumeInput.value.trim() || !jobInput.value.trim();

    analyzeBtn.classList.toggle("opacity-50", analyzeBtn.disabled);
    analyzeBtn.classList.toggle("cursor-not-allowed", analyzeBtn.disabled);

    $("clear-btn")?.classList.toggle(
      "hidden",
      !resumeInput.value.trim() && !jobInput.value.trim()
    );
  }

  function resetResults() {
    $("results-section")?.classList.add("hidden");
    $("empty-state")?.classList.remove("hidden");
    $("loading-state")?.classList.add("hidden");
  }

  function loadSampleData() {
    resumeInput.value = sampleResume;
    jobInput.value = sampleJob;

    clearError();
    resetResults();

    updateCounter("resume");
    updateCounter("job");
    updateButtons();
  }

  function getKeywords(text) {
    const stopWords = new Set([
      "the", "and", "for", "with", "from", "that", "this",
      "your", "you", "are", "our", "will", "have", "has",
      "into", "about", "their", "they", "then", "also",
      "using", "use", "used", "work", "working", "role",
      "job", "skills", "skill", "knowledge", "strong",
      "required", "requirements", "responsibilities",
      "experience", "candidate", "team", "build", "maintain",
      "develop", "development", "application", "applications",
      "software", "including", "such", "years", "ability"
    ]);

    const matches = text.toLowerCase().match(
      /[a-z][a-z0-9+#.-]{1,}/g
    ) || [];

    return [...new Set(matches)].filter(
      (word) => !stopWords.has(word)
    );
  }

  function renderKeywords(missing) {
    const list = $("missing-keywords-list");
    const empty = $("missing-keywords-empty");

    if (!list) return;

    list.replaceChildren();

    if (empty) {
      empty.classList.toggle("hidden", missing.length > 0);
    }

    missing.slice(0, 40).forEach((word) => {
      const chip = document.createElement("span");

      chip.className =
        "inline-flex rounded-full border border-amber-200 " +
        "bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900";

      chip.textContent = word;
      list.appendChild(chip);
    });
  }

  function renderSuggestions(resume) {
    const list = $("suggestions-list");
    const empty = $("suggestions-empty");

    if (!list) return;

    list.replaceChildren();

    const bullets = resume
      .split(/\n+/)
      .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
      .filter((line) => line.length > 25)
      .filter(
        (line) =>
          !/^(skills|education|experience|projects|summary|objective)\s*:/i.test(line)
      )
      .slice(0, 5);

    if (empty) {
      empty.classList.toggle("hidden", bullets.length > 0);
    }

    bullets.forEach((bullet, index) => {
      const card = document.createElement("div");
      card.className =
        "rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3";

      const title = document.createElement("p");
      title.className = "text-xs font-semibold text-stone-500";
      title.textContent = `Resume bullet ${index + 1}`;

      const text = document.createElement("p");
      text.className = "text-sm text-stone-800 leading-relaxed";
      text.textContent = bullet;

      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "rounded-lg border border-stone-200 bg-white px-3 py-2 " +
        "text-xs font-semibold hover:bg-stone-100";
      button.textContent = "Copy bullet";

      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(bullet);
        } catch {
          const area = document.createElement("textarea");
          area.value = bullet;
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
        }

        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = "Copy bullet";
        }, 1500);
      });

      card.append(title, text, button);
      list.appendChild(card);
    });
  }

  function analyzeResume() {
    clearError();

    const resume = resumeInput.value.trim();
    const job = jobInput.value.trim();

    if (!resume || !job) {
      showError("Please enter both your resume and the job description.");
      return;
    }

    const resumeWords = new Set(getKeywords(resume));
    const jobWords = getKeywords(job);

    if (!jobWords.length) {
      showError("Please enter a more detailed job description.");
      return;
    }

    const matched = jobWords.filter((word) => resumeWords.has(word));
    const missing = jobWords.filter((word) => !resumeWords.has(word));

    const score = Math.round(
      (matched.length / jobWords.length) * 100
    );

    if ($("score-number")) {
      $("score-number").textContent = `${score}%`;
    }

    if ($("score-badge")) {
      $("score-badge").textContent =
        score >= 75 ? "Strong keyword overlap" :
        score >= 45 ? "Partial keyword overlap" :
        "Low keyword overlap";
    }

    if ($("score-interpretation")) {
      $("score-interpretation").textContent =
        `Found ${matched.length} of ${jobWords.length} unique job-description keywords in your resume. This is a basic keyword comparison, not an AI evaluation of your qualifications.`;
    }

    const progress = $("score-progress-bar");

    if (progress) {
      progress.style.width = `${score}%`;
      progress.setAttribute("aria-valuenow", String(score));
    }

    renderKeywords(missing);
    renderSuggestions(resume);

    $("empty-state")?.classList.add("hidden");
    $("loading-state")?.classList.add("hidden");
    $("results-section")?.classList.remove("hidden");

    $("results-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  async function extractFile(file) {
    const extension = file.name.split(".").pop().toLowerCase();

    if (extension === "txt") {
      return await file.text();
    }

    if (extension === "pdf") {
      if (!window.pdfjsLib) {
        throw new Error(
          "PDF reader unavailable. Refresh the page or paste your resume text."
        );
      }

      const pdf = await window.pdfjsLib.getDocument({
        data: await file.arrayBuffer()
      }).promise;

      let result = "";

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();

        result += content.items
          .map((item) => item.str || "")
          .join(" ") + "\n";
      }

      if (!result.trim()) {
        throw new Error(
          "No selectable text found. This PDF may be scanned. Please paste the text manually."
        );
      }

      return result;
    }

    if (extension === "docx") {
      if (!window.mammoth) {
        throw new Error(
          "Word document reader unavailable. Refresh the page or paste the text."
        );
      }

      const result = await window.mammoth.extractRawText({
        arrayBuffer: await file.arrayBuffer()
      });

      return result.value || "";
    }

    throw new Error(
      "Unsupported file format. Upload a PDF, DOCX, or TXT file."
    );
  }

  async function uploadFile(type, file) {
    if (!file) return;

    clearError();

    const allowed = ["pdf", "docx", "txt"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(extension)) {
      showError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    const input = type === "resume" ? resumeInput : jobInput;
    const badge = $(type + "-file-badge");
    const name = $(type + "-file-name");
    const status = $(type + "-file-status");

    try {
      if (name) name.textContent = file.name;
      if (status) status.textContent = "Reading file...";
      badge?.classList.remove("hidden");

      const text = await extractFile(file);

      if (!text.trim()) {
        throw new Error("No readable text found in this file.");
      }

      input.value = text.trim();

      if (status) status.textContent = "Ready";
      updateCounter(type);
      updateButtons();
      resetResults();
    } catch (error) {
      badge?.classList.add("hidden");
      showError(error.message || "Could not read the selected file.");
    }
  }

  function connectUpload(type) {
    const input = $(type + "-file-input");
    const button = $(type + "-upload-btn");
    const card = $(type + "-card");
    const overlay = $(type + "-drop-overlay");
    const remove = $(type + "-file-remove");

    if (input && button) {
      button.addEventListener("click", () => input.click());

      input.addEventListener("change", (event) => {
        uploadFile(type, event.target.files?.[0]);
        event.target.value = "";
      });
    }

    remove?.addEventListener("click", () => {
      const textInput = type === "resume" ? resumeInput : jobInput;

      textInput.value = "";
      $(type + "-file-badge")?.classList.add("hidden");

      updateCounter(type);
      updateButtons();
      resetResults();
    });

    if (card) {
      card.addEventListener("dragover", (event) => {
        event.preventDefault();
        card.classList.add("dragover");
        overlay?.classList.remove("hidden");
      });

      card.addEventListener("dragleave", (event) => {
        if (!card.contains(event.relatedTarget)) {
          card.classList.remove("dragover");
          overlay?.classList.add("hidden");
        }
      });

      card.addEventListener("drop", (event) => {
        event.preventDefault();
        card.classList.remove("dragover");
        overlay?.classList.add("hidden");

        const file = event.dataTransfer?.files?.[0];
        if (file) uploadFile(type, file);
      });
    }
  }

  resumeInput.addEventListener("input", () => {
    updateCounter("resume");
    updateButtons();
    clearError();
  });

  jobInput.addEventListener("input", () => {
    updateCounter("job");
    updateButtons();
    clearError();
  });

  connectUpload("resume");
  connectUpload("job");

  $("upload-resume-cta")?.addEventListener("click", () => {
    $("resume-file-input")?.click();
  });

  $("sample-btn")?.addEventListener("click", loadSampleData);

  $("empty-sample-btn")?.addEventListener("click", () => {
    loadSampleData();
    $("resume-card")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

  $("clear-btn")?.addEventListener("click", () => {
    resumeInput.value = "";
    jobInput.value = "";

    $("resume-file-badge")?.classList.add("hidden");
    $("job-file-badge")?.classList.add("hidden");

    clearError();
    resetResults();

    updateCounter("resume");
    updateCounter("job");
    updateButtons();
  });

  analyzeBtn.addEventListener("click", analyzeResume);

  // Initialize the interface.
  updateCounter("resume");
  updateCounter("job");
  updateButtons();

  console.log("Hiring Ghost initialized successfully.");
})();
