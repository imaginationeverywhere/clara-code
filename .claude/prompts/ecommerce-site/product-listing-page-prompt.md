You are a senior full-stack engineer assigned to build a modern web application from scratch.

## Objective

Build a **Product Listing Page** for a Nike e-commerce web app that supports filterable, sortable product listings. Product data must render **server-side** using URL query parameters. The filter & sort UI must be built using **client-only components** that sync state to the URL, without performing any data fetching themselves.

The design should take inspiration from the attached layout and adapt it into this application’s brand identity, following the theme and typography defined in `src/app/globals.css`.

## Structure

* Use **Next.js App Router**.
* Use **`query-string`** for parsing and stringifying query parameters.
* Use **Next.js** for routing & shallow updates (do not use the `URLSearchParams` API directly).
* Query-related helpers must live in `/lib/utils/query.ts`.
* Keep logic modular: separate client components for `Filters.tsx` and `Sort.tsx`.
* Existing UI components like `Card.tsx` must be reused.
* Use Tailwind CSS, respecting global theme from `/src/app/globals.css`.
* Folder Structure

	```
	/src
	├── app/
	├── (root)/
	│   └── products/
	│       └── page.tsx              ← server-rendered product listing
	├── components/
	│   ├── Filters.tsx               ← client-only filters
	│   ├── Sort.tsx                  ← client-only sort
	│   └── Card.tsx                  ← reused product card
	├── lib/
	│   └── utils/
	│       └── query.ts              ← helpers for parsing/stringifying URL filters
	```

## ✅ Tasks

- 1. **Server-Rendered Product Page**

  * Read filter/sort state from `searchParams`.
  * Use helper functions from `/lib/utils/query.ts` to parse query params.
  * Filter and sort mocked product data accordingly (no data fetching. Use images from `/public` folder)
  * Render a responsive grid of `Card` components with filtered results.
  * Show active filters (e.g., badges like “Men”, “Red”, “Size: M”).

- 2. **Filters UI (`Filters.tsx`)**

	Build a **client-only** sidebar/drawer component:

  * Filter groups: Gender, Size, Color, Price Range (should be checkboxes).
  * Each group supports **multi-selection** with checkboxes.
  * Clicking a selected filter **removes** it from the URL.
  * Must use `query-string` npm package to **read and update URL filters**.
  * Must use **Next.js routing for URL params update**.
  * Reads initial state from URL and updates it without full reload.
  * **Responsive**:
    * Sidebar on desktop.
    * A collapsible filter drawer that slides in from the left on mobile devices, appearing above the product page with a semi-transparent overlay for focus.
  * Expands/collapses filter groups.
  * Styled with Tailwind while strictly respecting `src/app/globals.css` style theme

- 3. **Sort UI (`Sort.tsx`)**
	
	* Build a **client-only** dropdown or button group.
  * Options: Featured, Newest, Price (High → Low), Price (Low → High).
  * Sort state must sync to URL query param (e.g., `?sort=price_desc`).
  * Use `query-string` with Next.js routing.
  * Also resets pagination to page 1 on sort change.

- 4. **Query Utilities (`/lib/utils/query.ts`)**
	
	* Write reusable functions for updating and removing URL params.
	* Must use `query-string` package.
	* These should be pure functions (easy to test).

- 5. **Navigation Links**

	* Other pages (e.g., category navigation like “Men”) must link to `/products?gender=men`.
	* Clicking those links must pre-apply filters server-side and reflect them in UI.

- 6. **Responsiveness**

	* **Entire layout must be mobile-first and fully responsive**.
	* Filters collapse into drawer on small screens.
	* Use Tailwind utility classes (no inline styles unless strictly necessary).
	* Whole layout should respect max width structure as all other pages. It should be uniform in structure. 

- 7. **URL & State Sync**

	Filter/Sort UI should:
  * Stay in sync with URL query string.
  * Work with browser back/forward.
  * Clear filters via UI and update URL accordingly.
  * Emit filter changes that cause shallow navigation.

- 8. **Accessibility**

	* Use semantic HTML.
	* Keyboard-navigable filter checkboxes.
	* Visibly focused states.

## 📦 Output Requirements

- A fully functional server side rendered `/products` page:
	* Filters, sort options, and URL sync working end-to-end.
	* Responsive design with sidebar/drawer behavior.
- `Filters.tsx` and `Sort.tsx` implemented as isolated client-only components.
- `lib/utils/query.ts` utility with tested, modular URL-handling functions.
- All UI interactions update the URL and rerender data accordingly.
- Clean, maintainable code with modular structure and component reuse.
- Handle empty state gracefully if no products match filters.

## 📝 Notes

* No real backend integration; mocked data only.
* Filters should apply **immediately** on change (no Apply button).
* Refer to Next.js 16 way of reading values from searchParams
* Product cards should reflect active filters (e.g., show gender or color tags).
* Placeholder product data must mirror actual schema (refer to product structure + variants).
* Study the DB architecture provided separately before writing the seed function to match.