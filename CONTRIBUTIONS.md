# Project Contributions Log

*Automated summary of git contributions. Updated on every push.*

## 📅 July 3, 2026
**Lokeshwaran V R:**
- Docs: update CONTRIBUTIONS.md
- Feat: implement mobile responsiveness for landing page and dashboard
- Ci: implement automated contributions log generation
- Docs: update README with accessibility and performance scores
- Perf: optimize background images on auth pages using next/image
- Chore: enable production source maps for Lighthouse auditing
- Fix: add robots.txt and sitemap.xml to Clerk public routes
- Perf/SEO: optimize landing page images and add robots.txt
- Fix: resolve Clerk structural CSS warning by pinning ui version
- Chore: trigger vercel deployment
- Fix: add main landmark to dashboard layout and cleanup radix ui aria-hidden bug on navigation
- Fix: correct heading hierarchy in vault page (h3 -> h2)
- Fix: explicitly override Shadcn TabsTrigger text color to ensure WCAG AA compliance
- Chore: add agent rules for strict WCAG AA contrast and semantic html
- Fix: improve contrast ratio for inactive tabs
- Design: redesign tabs on room page to a sleek segmented control
- Fix: improve contrast ratio of Finished badge
- Fix: correct heading hierarchy in rooms page (h3 -> h2)
- Fix: add aria-labels to article card progress bar and dropdown menu trigger
- Feat: integrate Vercel SpeedInsights
- Fix: resolve Cumulative Layout Shift (CLS) issues in Typewriter and Mockup components
- Fix: add sr-only text and title to mockup carousel buttons for stricter a11y compliance
- Fix: darken text in LandingMockup for WCAG AA contrast compliance
- Fix: improve color contrast and accessibility (WCAG AA)
- Feat: implement interactive onboarding ritual with skip functionality
- Refactor: resolve final SonarCloud code smell issues
- Fix: enforce LF line endings to resolve SonarCloud encoding warnings
- Refactor: resolve SonarCloud maintainability and reliability issues
- Chore: remove unnecessary build logs
- Chore: force clean vercel build with nextjs preset
- Chore: trigger vercel build

**Vercel:**
- Install Vercel Speed Insights

**akash:**
- Fix: remove non-native interactive div wrapper in RoomAssignDropdown and widen coverage exclusions to resolve SonarQube quality gate failures
- Fix: resolve coverage report path for TypeScript files and correct test glob pattern in workflow
- Fix: resolve SonarQube quality gate failures by using static imports in coverage tests, ignoring lcov file, and excluding components/API routes from CPD
- Chore: replace deprecated sonarcloud-github-action with sonarqube-scan-action
- Fix: replace Math.random with cryptographically secure random values to resolve SonarQube PRNG security hotspots
- Chore: restore sonar-project.properties to fix SonarQube quality gate failures


## 📅 July 2, 2026
**Lokeshwaran V R:**
- Fix linting, type errors, and RoomAssignDropdown issues
- Fix Prisma build initialization error by lazy loading client
- Fix Next.js AST parser crash by removing String.raw in Clerk middleware config
- Fix: resolve syntax error caused by stray closing div tag
- Docs: update README with recent UX enhancements
- Fix: resolve keyboard event swallowing in CreateRoomDialog by moving it outside the event-intercepting wrapper
- Fix: RoomAssignDropdown click handling, add Create Room option, and OS detection for search shortcut
- Chore: commit deletion of useless and unused scripts and docs
- Chore: fix IDE warning in proxy.ts by using String.raw for regex matcher
- Docs: rewrite README to highlight the core workflow, chrome extension setup, and up to date feature logs
- Style: reduce vertical footprint of hero section with compact layout
- Style: restructure hero banner to include prominent how to use section next to extension promo
- Feat: add How to Use The Reading Room section to home dashboard
- Chore: clean up unnecessary documents and logs
- Feat: improve home layout, fix recent articles, and add refresh button for vault
- Style: reduce height and footprint of the chrome extension promo banner
- Fix: allow clicking on nested elements within highlights to open the edit/delete popover
- Style: make chrome://extensions/ url clickable in instruction guide
- Feat: add chrome extension promo banner to home screen and instruction page
- Feat: add chrome extension and corresponding API endpoint to save raw page HTML directly to reading room
- Fix: propagate actual fetch errors to the client so users understand when a site blocks the scraper
- Feat: make today's rediscovery section on home page display a random entry from the user's vault
- Style: revert ultra-wide reading mode to max-w-3xl for optimal typographic measure
- Style: remove prose 65ch width limit to allow for ultra-wide reading mode
- Style: widen article reading width to max-w-4xl
- Fix: wrap dropdown menu items and labels in DropdownMenuGroup to resolve Base UI missing context error
- Fix: change font-source-serif to font-serif in reader page so appearance options actually work
- Fix: room page ui polish including empty states, tab active border alignment, and button sizes
- Fix: force flex-col on room tabs to prevent content rendering side-by-side
- Chore: replace realistic library image with an elegant minimalist one-line sketch for auth backgrounds
- Style: nuke 200+ lines of brittle css hacks for the profile page and replace with native clerk elements API to enforce editorial theme robustly
- Style: nuke all custom dark theme auth overrides and reset to a clean, crisp light theme card to guarantee native clerk font and spacing behavior
- Style: enforce inter and source serif fonts in auth dark theme overrides
- Style: completely drop unreliable CSS overrides in favor of native Clerk elements and variables API for safe, robust styling
- Style: completely rewrite auth input css to fix visual glitches, uncentered text, and missing borders
- Style: fix squashed text vertically and correctly space inputs from labels by restoring heights and padding
- Style: aggressively strip borders from formFieldInputGroup wrapper to fix lingering harsh input lines
- Style: remove harsh 4-sided box borders from auth inputs in favor of elegant bottom line
- Style: remove padding override from form inputs to fix broken vertical text alignment
- Style: aggressively force label padding by targeting raw html tag to fix clerk flex overrides
- Style: fix clerk label spacing by forcing flex gap on formFieldRow
- Style: force margin-top on auth input fields to guarantee spacing from labels
- Style: explicitly target formFieldLabelRow to enforce label spacing
- Style: restore dark frosted glass for auth inputs with backdrop blur to fix glow bleed, and increase label margins
- Style: fix form readability by blocking background glow with solid dark slate and high contrast continue button
- Style: apply premium dark academia polish to auth forms with editorial typography, noise texture, and animations
- Style: upgrade auth form to premium dark academia aesthetic with ink glass and gold accents
- Style: tone down primary continue button in auth form to dark translucent glass
- Style: add subtle semi-transparent background to input boxes and social button
- Style: enhance input box and button aesthetics for glass auth forms
- Fix: enforce transparent inputs and fix chrome autofill in auth forms
- Fix: override clerk variables and footer background to ensure transparent auth forms
- Fix: explicit dark theme elements overrides to fix layout.tsx conflict
- Fix: use clerk dark theme to fix invisible footer text
- Style: revert background image to realistic library
- Style: add library artworks and set default background to oil painting
- Style: expand fireplace glow to cover bottom of auth panel
- Style: center fireplace glow in auth panel and enhance animation
- Feat: add animated fireplace glow to auth pages
- Style: extend background image and dust motes across the entire screen, add frosted glass to auth form
- Fix: override Clerk root CSS variables to correctly render dark mode
- Style: convert auth pages to true dark mode and fix global scrolling
- Style: redesign sign-in and sign-up pages to match app aesthetic
- Feat: add Export to Markdown button to the article reading interface
- Fix: adjust mockup text sizes to prevent layout overlap
- Style: add atmospheric dust motes and button shimmer to landing page
- Style: reduce heights and enforce 100dvh on landing page to eliminate scrollbar
- Feat: upgrade landing page mockup into a fully animated multi-feature ad campaign carousel
- Feat: animate landing page mockup to simulate an interactive highlighting sequence
- Feat: add interactive glowing app mockup to landing page
- Feat: use Vercel AI SDK to stream the dynamic quote for a faster typewriter effect
- Perf: stream AI quote using React Suspense and add film grain texture
- Feat: use Gemini AI to generate infinite unique reading quotes on landing page
- Feat: update dynamic quotes to include diverse global authors
- Feat: add dynamic randomized quotes to landing page
- Style: enhance landing page UI with premium micro-animations and flattened shadows
- Style: switch clerk customization to inline styles to guarantee overrides
- Style: remove manual padding from clerk UI to fix scrollbar overflow
- Style: force Clerk styles with important modifiers and remove local appearance props
- Style: aggressively customize Clerk UI to match premium brand aesthetic
- Feat: complete highlight customizer with premium colors and interactive metadata popover
- Style: switch page transition to an elegant cross-fade
- Style: change page transition to a physical paper settling animation
- Fix: force template remount and intensify page flip animation
- Style: update page transition to 3D page flip animation
- Feat: add global page transition animation using template.tsx
- Style: animate landing page with typewriter logo and staggered slide-ups
- Style: switch landing page to dark overlay with white text for better readability
- Style: reduce typing speed and hide cursor on completion
- Chore: update app name to 'The Reading Rooms' across all user-facing UI
- Style: fix logo text clipping and restore clean back button
- Style: perfect three-line typing logo and prominent back button
- Style: fix logo to be two-line staggered typing animation
- Style: add typing animation to logo and position back button on left panel
- Style: move logo to right panel and add back button on auth pages
- Style: convert auth pages to premium split-screen layout
- Style: apply animated library background to landing page
- Feat: add premium animated library background to auth pages
- Style: remove redundant auth page headers to fit perfectly in viewport
- Style: make app title prominent on auth pages
- Fix: revert routing=path and add test script
- Fix: resolve barebone sign-in page by explicitly configuring Clerk routing and Tailwind source
- Fix: adjust pgvector dimensions for gemini-embedding-2
- Feat: Vector Search & RAG Integration via pgvector
- Fix: resolve remaining SonarCloud warnings and syntax errors
- Refactor: resolve SonarCloud code smells and complexity issues
- Fix: resolve IDE warnings and accessibility issues

**akash:**
- Fix: dialog trigger styling, clerk colorForeground type error, and article export schema error
- Fix: resolve Next.js segment config error in proxy.ts, fix script TS types and user schema mismatch in test-rag


## 📅 July 1, 2026
**akash:**
- Docs: update README.md and add DEVELOPER_GUIDE.md detailing completed features and next steps
- Feat: replace Room View highlights placeholder and implement Room Settings & Delete dialog
- Fix: resolve new linter warnings on mouse events and semantic roles in ReaderPage
- Feat: implement Insights Analytics Dashboard with daily heatmap, growth line chart, and reading streaks
- Fix: change hover background color from pure black to clearly visible gray #444444 on Save buttons
- Fix: resolve static analysis warnings in ReaderPage
- Fix: memoize highlightedHtml in ReaderPage to prevent browser selection clearing on render
- Style: fix custom selection highlight, improve dropdown aesthetics, and fix button hover text contrast
- Feat: implement Wikipedia Concept Lookup API and wire it to ConceptSlideOver
- Fix: wrap DropdownMenuLabel in DropdownMenuGroup to satisfy Base UI group context
- Feat: enforce onboarding check in layout and add auth redirect fixes
- Feat: implement article deletion on backend and frontend, and fix article route UUID lookup bug
- Feat: integrate onboarding flow with backend api and add user fallback
- Chore: add local postgres database migrations
- Docs: overhaul all documentation for ship-readiness
- Fix: add lib/store.ts re-export and sync local changes

**Lokeshwaran V R:**
- Docs: update README with SonarCloud CI details and Scholarly Minimalism UI aesthetic
- Fix: resolve nested ternaries, redundant code blocks, and accessibility roles for SonarCloud
- Fix: replace console calls with logger and ignore HTML injection rules in SonarCloud
- Chore: exclude UI and API routes from SonarCloud coverage requirement
- Refactor: reduce cognitive complexity in save route and reader page
- Fix: resolve lint warnings in test files
- Fix: resolve SonarCloud Quality Gate failures - coverage, duplication, code smells
- Feat: redesign landing page, auth pages, and profile settings
- Fix UI glitches, room export, and seed script
- Remove obsolete doc files
- Apply design system and clean up unnecessary files
- Fix linting errors and code smells
- Add SonarCloud configuration
- Docs: update environment variables setup instructions
- Fix: use pg adapter for direct TCP connection with Prisma 7
- Chore: ignore .clerk directory
- Docs: update README with latest features


## 📅 June 30, 2026
**Lokeshwaran V R:**
- Fix: Add postinstall script for prisma generate to fix Vercel build
- Feat: Add Global Search (Cmd+K) and AI Synthesis Engine Insights
- Feat(ingest): add DOI, arXiv, and PDF ingestion; add literature export
- Fix: rename middleware.ts to proxy.ts per Next 16 conventions
- Fix: resolve IDE warnings and type errors
- Feat: complete phase 5 highlighting and vault
- Feat: complete phase 4 home dashboard and rooms
- Feat: complete phase 3 reader view and annotation scaffold
- Feat: complete phase 1 backend and phase 2 article saving

**akash:**
- Docs: note GitHub repo push status
- Chore: add API smoke test and update documentation
- Chore: commit current backend persistence and API updates
- Docs: update handoff guides and current backend baseline
- Chore: bootstrap backend foundation and handoff docs
- Initial commit from Create Next App

**ReadersRoom-Lab:**
- Initial commit


