You are a senior full-stack engineer assigned to build a modern web application from scratch.

## Objective

Build a **Product Details Page** UI for a Nike e-commerce app that renders a rich product gallery, color/size selectors, and product metadata. The page must be **pixel-perfect** to the attached desktop design and **strictly responsive across mobile and tablet devices**. It should open when a user clicks any product card and feel **uniform** with the rest of the site.

⚠️ **Strict Requirement**: The entire page must be **server-rendered**. Only interactions and dynamic UI parts that require client-side state (gallery, swatches, size picker) must be placed in isolated client components under `/components`.

⚠️ **Strict Requirement**: Follow the provided design screenshots **exactly**. No deviations. Do gallery, collapsible section, product information UI as is. Strictly follow same layout. 

⚠️ **Strict Requirement**: Code must be **super clean, modular, and easy to understand** — use clear file/variable names and maintain a clean separation between server and client components.

## Structure

* **Framework**: Next.js App Router with server components.
* **Dynamic route**: `src/app/(root)/products/[id]/page.tsx` (server-rendered entrypoint).
* **UI-only**: use **mocked product data** (no fetching, no DB, no cart/favorite logic).

  * Use static images from `/public` for now.
* **Icons**: use **lucide-react** consistently.
* **Styling**: Tailwind CSS; strictly follow `src/app/globals.css` (no inline styles).
* **Component structure**:

  ```
  /src
  ├── app/
  │   └── (root)/
  │       └── products/
  │           └── [id]/
  │               └── page.tsx          ← server-rendered product detail page
  ├── components/
  │   ├── ProductGallery.tsx            ← client (gallery UI + swatches)
  │   ├── SizePicker.tsx                ← client (size selector)
  │   ├── CollapsibleSection.tsx        ← client (details/shipping/reviews)
  │   └── Card.tsx                      ← reuse for “You Might Also Like”
  ```

## ✅ Tasks

1. **Server-Rendered Page**

   * Implement `/products/[id]/page.tsx` as a **server component**.
   * Read `{ params: { id } }` to load static mock product data.
   * Compose the page using smaller modular components.

2. **Product Gallery (Client Component)**

   * Main image + thumbnail strip per design.
   * Strict image guards:

     * Render only if at least one valid image exists.
     * First valid image is default main image.
     * Auto-skip broken images; fallback to `ImageOff` Lucide icon with empty state.
   * Keyboard accessible (arrow keys + focusable thumbnails).

3. **Color & Variant UI (Client Component)**

   * Show color swatches for variants with valid images.
   * Selecting a swatch updates the gallery to that variant.
   * Use Lucide icons (e.g., `Check`) for selection indicators.

4. **Size Picker (Client Component)**

   * UI-only dummy sizes.
   * Visual toggle only, no backend/state.
   * Accessible with keyboard navigation.

5. **Product Metadata (Server Rendered)**

   * Title, price, compare-at price, discount badge, description/specs.
   * “Add to Bag” and “Favorite” = **static UI only** (no handlers).
   * Use Lucide icons (`Heart`, `ShoppingBag`, `Star`).

6. **“You Might Also Like” Section**

   * Server-rendered grid of static products using `Card.tsx`.
   * Each card links to `/products/[id]` via `next/link`.
   * Apply the same image guard rules (no broken `<img>`).

7. **Navigation**

   * Ensure product cards across the app route to this page correctly.

8. **Responsiveness**

   * **Desktop**: match desktop screenshot **exactly**.
   * **Mobile/Tablet**: follow attached screenshot layout **strictly**:

     * Main product image on top.
     * Thumbnails scrollable below (horizontal overflow only for gallery).
     * Rest of content stacked in a clean, single-column layout.
   * Use existing breakpoints/utilities in `globals.css`.

9. **Accessibility**

   * Semantic HTML, alt text, focus styles.
   * Swatches and thumbnails keyboard navigable with visible focus rings.

10. **Empty/Skeleton States (UI-Only)**

* Skeleton placeholders for gallery + text.
* Graceful fallbacks for missing images with `ImageOff` icon.
* Rest of content should always render even if gallery is empty.

11. **Collapsible Sections (Client Component)**

* “Product Details” → dummy text.
* “Shipping & Returns” → dummy text.
* “Reviews” → empty state.

## 📦 Output Requirements

* A production-ready, **server-rendered** product details page in `page.tsx`.
* Pixel-perfect desktop layout and strict adherence to mobile/tablet screenshots.
* Gallery/variants/sizes as client components in `/components`.
* Super clean, modular code with clear naming and separation.
* Uses **lucide-react** for all icons.
* Uniform styling with `globals.css`.
* No data fetching, DB work, or business logic — **UI only**.

## 📝 Notes

* Prefer `next/image` with width/height + `sizes` to avoid CLS.
* Keep components focused and reusable.
* Absolutely no inline styles; follow global theme tokens.
* **Strictly follow the provided design screenshots**. Do not deviate.
* Maintain **clear separation of concerns** between server and client