# Resume Match

> Know how your resume matches the job. Compare your resume with a job description to discover missing keywords and improve your resume bullets.

Resume Match is a focused, production-quality web application built for job seekers. Paste your resume and a target job description, click one button, and immediately receive an objective match score, missing keywords presented as chips, and three suggested resume bullet rewrites grounded in your real experience.

---

## Features

- **Resume Match Score (0–100%)**: Instant textual alignment percentage with an animated horizontal progress bar and clear alignment bands (Significant Gap, Moderate, Strong, High Match).
- **PDF & Word Document Upload**: Upload `.pdf`, `.docx`, `.doc`, or `.txt` files directly via click or drag-and-drop. Text is extracted client-side in-memory without uploading your file to any server storage.
- **Missing Keywords Chips**: High-signal technologies, competencies, and qualifications identified in the job description that were not clearly found in your resume.
- **Three Grounded Bullet Rewrites**: Concrete, truthful resume improvements that enhance clarity, relevance, and action verbs without fabricating achievements, metrics, or technologies.
- **One-Click Copy**: Copy any suggested rewrite directly to your clipboard with temporary visual feedback.
- **Privacy-First**: No database, no logins, no persistent storage, and no tracking. All texts are processed in-memory.
- **Sample Data Loader**: Pre-loads a realistic software engineering resume and job description to test the tool in one click.
- **Responsive, Light-First Design**: Optimized for mobile, tablet, and desktop with accessible labels, visible focus rings, and WCAG AA contrast.

---

## Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (`app.js`), Tailwind CSS via CDN.
- **Backend / Serverless**: Node.js Vercel Serverless Function (`api/analyze.js`) and Express development runner.
- **AI Models**: Supports Google Gemini (`gemini-3.8-flash`) and OpenAI (`gpt-4o-mini` / compatible APIs).
- **Zero Heavy Frameworks**: No React, Next.js, or complex frontend build step required to run the client.

---

## File Structure

```text
resume-match/
├── index.html       # Single-page HTML5 layout with Tailwind CSS CDN
├── app.js           # Vanilla JavaScript for client-side state & UI rendering
├── api/
│   └── analyze.js   # Vercel serverless function (POST /api/analyze)
├── README.md        # Documentation and deployment guide
└── .gitignore       # Git ignore rules for node_modules and env files
```

---

## Local Development

> **Note:** Opening `index.html` directly via `file://` in a browser will not work because the application communicates with the backend API endpoint at `/api/analyze`.

### Method 1: Using the Included Node Server

1. **Clone or download the repository:**
   ```bash
   git clone <repo-url>
   cd resume-match
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API key in `.env`:**
   Create a `.env` file in the project root:
   ```env
   # Option A: Google Gemini (default in AI Studio)
   GEMINI_API_KEY="your_gemini_api_key_here"

   # Option B: OpenAI or OpenAI-compatible endpoint
   OPENAI_API_KEY="your_openai_api_key_here"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in your browser:**
   Visit `http://localhost:3000`.

---

### Method 2: Using the Vercel CLI

1. **Install Vercel CLI globally (if not already installed):**
   ```bash
   npm install -g vercel
   ```

2. **Link and set your environment variables:**
   ```bash
   vercel env add OPENAI_API_KEY
   # or
   vercel env add GEMINI_API_KEY
   ```

3. **Run local emulation:**
   ```bash
   vercel dev
   ```

4. **Open the local URL:**
   Open `http://localhost:3000` in your browser.

---

## How to Deploy to Vercel

1. **Push your repository to GitHub, GitLab, or Bitbucket.**
2. **Import the repository in your [Vercel Dashboard](https://vercel.com).**
3. **Add the Environment Variable in Vercel Project Settings:**
   - Name: `OPENAI_API_KEY` (or `GEMINI_API_KEY`)
   - Value: `your-secret-api-key`
4. **Deploy:** Click **Deploy**. Vercel will automatically host `index.html` as the frontend and route `/api/analyze` to `api/analyze.js`.

---

## Privacy Considerations

- **No Database**: Submitted resumes and job descriptions are never saved to any database or local file store.
- **In-Memory Processing**: Inputs exist solely in transient memory for the duration of the API call.
- **No Telemetry of User Resumes**: Full resume texts are not written to persistent server logs.
- **External AI Providers**: The text is sent securely to your configured AI provider (Google Gemini or OpenAI) solely to complete the requested analysis.

---

## API Usage & Endpoint Specification

### `POST /api/analyze`

**Request Body:**
```json
{
  "resume": "Software engineer with 3 years of experience...",
  "jobDescription": "We are seeking a Frontend Engineer skilled in React..."
}
```

**Successful Response (200 OK):**
```json
{
  "score": 78,
  "missingKeywords": [
    "React",
    "TypeScript",
    "REST APIs",
    "Unit testing"
  ],
  "suggestions": [
    {
      "original": "Built customer-facing web applications using JavaScript and CSS framework.",
      "rewrite": "Developed responsive, accessible customer-facing web applications using modern JavaScript and CSS, improving page load efficiency and user experience.",
      "reason": "Highlights modern web standards and accessibility without fabricating numerical metrics."
    }
  ]
}
```

---

## Limitations of AI-Generated Resume Matching

- **Textual Alignment Only**: The match score measures syntactic and semantic alignment with the words in the job description. It is not an assessment of candidate worth or an algorithmic hiring guarantee.
- **Keyword Honesty**: Users should only add missing keywords to their resume if they genuinely possess those skills and experience. Keyword stuffing without real competence harms interview outcomes.
- **Review Before Submitting**: AI-suggested bullet rewrites should always be reviewed and refined by the candidate to ensure they accurately reflect personal contributions and voice.
