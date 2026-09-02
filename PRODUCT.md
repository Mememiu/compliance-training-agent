# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are employees who need to discover, complete, and pass assigned training. A secondary role is the training owner or administrator who edits and organizes course content for the organization.

## Product Purpose

Provide one learning space for company training across compliance and other organizational topics. Employees should be able to understand what they need to learn, make steady progress, and complete assessments; course owners should be able to maintain the learning material.

## Positioning

The product is intended to grow beyond a single compliance syllabus into a reusable, multi-domain training room. The exact differentiating mechanism is an open product decision; the current implementation combines structured courses, lessons, quizzes, progress tracking, and an AI assistant.

## Operating Context

Employees use the product as a recurring web workspace for assigned or available courses, lesson reading, quiz completion, and progress review. Course owners use it to edit and curate training content. Training may cover compliance, information security, company policies, business practices, and culture as the catalog expands.

## Capabilities and Constraints

- Existing product is a React + TypeScript + Vite web application with a Node/Express server and SQLite persistence.
- Existing routes cover a training dashboard, course details, lessons, quizzes, AI chat sessions, and settings.
- Existing course content includes data privacy, anti-corruption, and information security modules.
- Existing AI chat and permission flows are implementation evidence, not yet a confirmed brand promise.
- The current repository is a working prototype/template and needs product-specific copy, information architecture, and course-owner editing workflows.
- The working name is “培训室”; the name, logo, and final information architecture remain replaceable decisions.

## Brand Commitments

- Use “培训室” as a temporary working name only.
- The brand should feel suitable for a broad company learning space, not limited to legal compliance.
- Do not assume an existing corporate logo, color palette, or visual guideline; none is present in the repository.

## Evidence on Hand

- `src/components/TrainingDashboard.tsx`, `CourseDetailPage.tsx`, `LessonView.tsx`, and `QuizView.tsx` demonstrate the current employee learning flow.
- `src/data/courses.ts` contains real product-domain course copy and quiz content for data privacy, anti-corruption, and information security.
- `src/components/SettingsPage.tsx` and agent configuration components demonstrate existing configuration surfaces.
- No approved logo, photography library, testimonials, customer proof, or corporate brand guideline is present. Future work must not fabricate these.

## Product Principles

1. Make the next learning action obvious.
2. Treat training as a living company capability, not a compliance checkbox.
3. Respect employee time with focused, scannable learning flows.
4. Give course owners enough structure to keep content trustworthy and current.
5. Keep the system extensible across topics without making every topic feel identical.

## Accessibility & Inclusion

The product is a web application used by a broad employee population. Future interface work should target WCAG 2.1 AA, preserve keyboard access, use text and icon cues together, and keep body content readable in Chinese and mixed-language contexts.
