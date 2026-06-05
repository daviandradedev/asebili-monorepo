# Accessibility Report

**Product scope:** Asebili teaches **written Portuguese** to deaf **LIBRAS** users. LIBRAS is the instruction medium, not the learning objective. See [PRODUCT.md](./PRODUCT.md).

Date: 2026-06-05

## Baseline Used

- WCAG 2.2, aiming at Level AA as baseline and selected AAA practices where they directly help deaf students who use LIBRAS and are learning written Portuguese.
- WCAG 1.2.6 Sign Language (Prerecorded), Level AAA, as product guidance for activity videos.
- W3C COGA guidance for cognitive and learning accessibility, especially familiar symbols, clear structure, mistake prevention, reduced memory load, and support beyond text.
- EN 301 549 as broader ICT accessibility reference for web, mobile software, and non-web surfaces.
- VLibras as Brazilian public assistive technology for web translation support.

Reference links:

- https://www.w3.org/TR/wcag/
- https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- https://w3c.github.io/wcag/understanding/sign-language-prerecorded
- https://w3c.github.io/coga/content-usable/
- https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras/vlibras

## What Was Implemented

### Web

- Added a skip link to jump directly to the main content.
- Added `id="main-content"` landmarks to login and dashboard pages.
- Added the VLibras widget to the global layout as a supplemental Libras support tool.
- Added visible focus outlines with high contrast.
- Added `prefers-reduced-motion` support.
- Added forced-colors support for high contrast environments.
- Increased minimum button hit target to 48px.
- Added `role="alert"` and `aria-live="assertive"` for form and page errors.
- Added instructor-facing guidance to publish human-recorded Libras videos in activities.
- Added URL input hints for Libras video fields.
- Kept dashboard data server-rendered first, reducing blank/loading states.

### Mobile

- Added `expo-video` for native Libras video playback.
- Added `expo-haptics` for non-audio feedback on success, warning, and error states.
- Added a reusable `LibrasVideo` component.
- Replaced raw video URL display with a real native video player.
- Added fallback UI when an activity has no Libras video.
- Added six large visual slots for the class access code.
- Restricted class code input to six uppercase alphanumeric characters.
- Added native alerts for important errors.
- Added large touch targets for answer buttons.
- Added high-contrast visual answer symbols: check for correct and cross for incorrect.
- Added `accessibilityLabel`, `accessibilityHint`, and `accessibilityRole` to key mobile controls.
- Wrapped mobile screens in safe area and scroll containers for better small-screen resilience.
- Added a class activity picker so students choose an activity before starting.

## What The Project Has Now

- App-owned authentication through Better Auth.
- PostgreSQL persistence through Neon/Postgres and Drizzle.
- Public student APIs that do not expose database credentials to the mobile app.
- Activity model with `libras_video_url`.
- Instructor dashboard for creating classes and activities.
- Student mobile flow for entering a class code, choosing an activity, and completing a visual quiz.
- Response logging from mobile to server.
- Basic web accessibility affordances.
- Native mobile video playback for Libras content.
- Haptic feedback for users who cannot rely on audio feedback.

## What The Project Still Does Not Have

- A full Libras-first onboarding flow with professionally recorded videos for every screen.
- A library of standardized visual pictograms validated with Deaf Libras users.
- A child-safe activity interaction model beyond basic correct/incorrect buttons.
- Full offline mode for classrooms with unstable internet.
- Captions, transcripts, and fallback alternatives for every video.
- A content moderation/review workflow for instructor-uploaded activity videos.
- Video storage integration such as Cloudflare R2, S3, or Vercel Blob.
- Automated accessibility tests in CI.
- Manual screen reader test evidence.
- Manual keyboard-only test evidence.
- Manual tests with Deaf children/adults who use Libras as primary language.
- Legal conformance report such as VPAT/ACR.

## Current Impediments

- The app cannot be truly Libras-first without actual Libras media. UI changes help, but they do not replace human-signed instruction videos.
- Automatic Portuguese-to-Libras translation is not reliable enough to be the only accessibility layer for users who do not read Portuguese.
- The current database stores a URL for activity video, but the project does not yet include a production storage pipeline.
- Memory and matching activities still need mobile-native accessible interactions beyond the current visual quiz path.

## What Should Exist But Is Not Mature In The Market Yet

- Reliable, production-grade automatic translation from arbitrary Portuguese educational UI/content into natural Libras for children and adults.
- Real-time bidirectional Libras recognition in mobile browsers/apps with enough accuracy for education and assessment.
- Automatic generation of culturally appropriate Libras educational videos from text with pedagogical quality comparable to human interpreters.
- Standardized, universal pictogram sets that work consistently for Deaf Libras-first children and adults across regional, cultural, and literacy differences.
- Automated accessibility scanners that can validate Libras comprehension, not only DOM semantics, color contrast, and keyboard behavior.

## Recommended Next Steps

1. Record short Libras videos for: login help, class code entry, activity start, correct answer, incorrect answer, no activity, and network error.
2. Add production video storage and validate MIME type, file size, duration, and moderation status.
3. Build a visual activity picker for the mobile class flow.
4. Add an instructor checklist that prevents publishing an activity without Libras video.
5. Add automated checks with axe for web and manual accessibility test scripts for mobile.
6. Run moderated usability tests with Deaf Libras-first users before the 30+ person test.
7. Create a VPAT/ACR-style document only after manual assistive technology testing.
