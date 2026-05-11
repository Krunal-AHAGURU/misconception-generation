# MCQ Reasoning UI/UX - Misconception Generation

A specialized validation tool for AhaGuru mentors and directors to assess the quality of AI-generated reasoning for multiple-choice questions.

## Table of Contents
- [Local Setup](#local-setup)
- [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
- [Features](#features)

## Local Setup

### Prerequisites
- **Node.js** (v16 or higher) and **npm** (v7 or higher)
- **Git** (for version control)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd misconception-generation
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
Create a `.env` file in the root directory with any required environment variables:
```bash
# Add your configuration here if needed
VITE_API_URL=http://localhost:3000
```

### Step 4: Run Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000` with hot module reloading enabled.

### Step 5: Open in Browser
Navigate to `http://localhost:3000` in your web browser.

### Useful Development Commands
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Check TypeScript types
npm lint

# Clean build artifacts
npm run clean
```

## Cloudflare Pages Deployment

### Prerequisites
- Cloudflare account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- GitHub/GitLab account linked to your repository

### Step 1: Push Code to GitHub
1. Create a repository on GitHub
2. Push your code:
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### Step 2: Create Cloudflare Pages Project
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Select **Connect to Git**
4. Authorize Cloudflare with GitHub
5. Select your repository

### Step 3: Configure Build Settings
In the Cloudflare Pages configuration:

| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` |

### Step 4: Set Environment Variables (if needed)
1. In Cloudflare Pages settings, go to **Settings** → **Environment Variables**
2. Add any required environment variables (e.g., `VITE_API_URL`)

### Step 5: Deploy
1. Click **Save and Deploy**
2. Cloudflare will automatically build and deploy your site
3. Your site will be available at `https://<project-name>.pages.dev`

### Step 6: Custom Domain (Optional)
1. Go to **Pages** → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Cloudflare

### Continuous Deployment
- Every push to your main branch automatically triggers a new deployment
- Pull requests generate preview deployments
- Check deployment status in Cloudflare Pages dashboard

## Features

- **Browse Questions**: Scroll through the list of MCQs
- **Compare Reasonings**: Click on any option (A, B, C, or D) to view AI reasoning comparisons
- **Vote**: Select the best reasoning for each question
- **Persistence**: Votes are automatically saved to browser's local storage
- **Results Review**: Check a summary of your selections
- **LaTeX/Math Support**: Full support for mathematical formulas using LaTeX notation (inline `\(...\)` and display `\[...\]` formats)

## Project Structure
```
.
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   └── data/
│       └── mcqs.json     # MCQ data
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS config
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies

```

## Tech Stack
- **React 19** - UI framework
- **Vite 6** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **KaTeX** - Mathematical formula rendering
- **React Markdown** - Markdown rendering

## LaTeX/Math Formatting

The application fully supports LaTeX mathematical notation for rendering complex equations and special symbols.

### Formatting Guidelines

#### Inline Math (within text)
Use `\(` and `\)` delimiters:
```
If \(a={{2}^{3}}\\times {{3}^{2}}\), then...
```
Renders as: If $a=2^3 \times 3^2$, then...

#### Display Math (centered on own line)
Use `\[` and `\]` delimiters:
```
\[
x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}
\]
```

### Where LaTeX is Supported
- ✅ Question text (`question_text`)
- ✅ Explanations (`explanation`)
- ✅ Key justifications (`why_right`)
- ✅ Pedagogical concepts (`core_concept`)
- ✅ Next steps (`next_step`)

### Common LaTeX Examples
```latex
% Fractions
\frac{a}{b}

% Powers/exponents
a^{2}, b^{n}

% Subscripts
a_{1}, x_{n+1}

% Roots
\sqrt{x}, \sqrt[3]{x}

% Multiplication sign
\times or \cdot

% Greek letters
\alpha, \beta, \gamma, \pi, \theta

% Set notation
\in, \subset, \cup, \cap

% Arrows
\rightarrow, \Rightarrow, \leftrightarrow

% Summation/Product
\sum_{i=1}^{n}, \prod_{i=1}^{n}
```

### Rendering Quality Tips
- Use `{{` and `}}` for literal braces in JSON to avoid escaping issues
- Always escape backslashes: `\\` becomes `\`
- Keep inline math short to avoid layout breaking
- Test formulas in the application to verify rendering

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
npm run dev -- --port 3001
```

### Build Errors
Clear dependencies and reinstall:
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues
- Check Cloudflare Pages build logs for errors
- Verify environment variables are set correctly
- Ensure Node.js version is 16+

## Support
For issues or questions, please check the [AGENTS.md](./AGENTS.md) file for more information.
