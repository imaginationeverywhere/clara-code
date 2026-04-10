You are a senior full-stack engineer assigned to build a modern web application from scratch.

## 💼 Objective
Design and build fully responsive, styled authentication pages (Sign In and Sign Up) using a shared group layout. These pages must support email/password login, social sign-in buttons (Google and Apple), and follow the application’s theme and typography.

The design should take inspiration from the attached layout and adapt it into this application’s brand identity, following the theme and typography defined in `src/app/globals.css`.


## 🧰 Structure
- Use Next.js App Router and group layout feature for sign-in and sign-up pages.
- Respect existing theme and typography in src/app/globals.css.
- Folder structure:
	/src
	├── app/
	│   ├── (auth)/
	│   │   ├── layout.tsx ← shared layout
	│   │   ├── sign-in/
	│   │   │   └── page.tsx
	│   │   └── sign-up/
	│   │       └── page.tsx
	├── components/
	│   ├── AuthForm.tsx
	│   └── SocialProviders.tsx
	├── public/

## ✅ Tasks
- Create a layout in `/app/(auth)/layout.tsx` with proper structure, margins, and responsiveness.
- Put/Move everything else in `/app/(root)/layout.tsx` file which will have its own shared layout. 
- Ensure the design feels cohesive across both pages.
- Sign In and Sign Up pages should use common form components.
- Create email/password inputs.
- Add social sign-in buttons (Google, Apple) using icons from Lucide or public assets.
- Style all components with Tailwind CSS using the theme in `globals.css`.
- Make it Responsive.
- Design must work well across devices.
- Use mobile-first and accessible practices.

## 📦 Output Requirements
- `/sign-in` and `/sign-up` pages with shared layout
- Responsive, mobile-friendly, accessible forms
- Reusable form and provider components
- Assets must be sourced from `/public`

## 📝 Notes
- Keep UI modular and theme-aligned.
- Focus is only on frontend (UI). Auth logic will be implemented separately.
- Maintain clean code and proper folder structure.