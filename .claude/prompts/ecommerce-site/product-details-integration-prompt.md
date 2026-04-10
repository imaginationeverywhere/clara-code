You are a **Senior Full-Stack Engineer** tasked with integrating backend product data into a fully responsive Product Details Page with flawless image handling and consistent UI.

## 💼 Objective

Build a **fully integrated Product Details Page (PDP)** in a Nike e-commerce app using **real backend data** from existing schemas.
The PDP must:

* Fetch the correct product when a user clicks a product card.
* Show **reviews** and **recommended products** via **server actions** wrapped in `Suspense` (non-blocking).
* Handle product → variant → image relations **correctly** (no shortcuts or buggy logic).
* Gracefully render a **Not Found** block if product doesn’t exist.

## ⚙️ Structure

* **Next.js App Router** with a **server component** page:
  `src/app/(root)/products/[id]/page.tsx`

* **Backend**:

  * **Drizzle ORM** with PostgreSQL.
  * Study all schemas in `src/lib/db`.
  * **Do not create or modify DB schemas**.
  * Update `src/lib/actions/product.ts`:

    * Refine `getProduct(productId)` to fetch product + variants + images + metadata.
    * Create new server actions:

      * `getProductReviews(productId)` → returns approved reviews.
      * `getRecommendedProducts(productId)` → returns related products.

* **Rendering**:

  * The main PDP is server-rendered.
  * Reviews + Also Like are server-rendered too, but loaded inside `Suspense` so they never block main PDP rendering.

## ✅ Tasks

1. **Refine `getProduct`**

   * Input: `productId`.
   * Return:

     * Title, subtitle, description, price, compare price.
     * Variants (color, size, stock, price).
     * Images grouped by variant.
     * Category, brand, gender.
   * Use Drizzle relations (no N+1 queries).
   * Return `null` if product doesn’t exist.

2. **Implement `getProductReviews(productId)`**

   * Returns array of:

     ```ts
     type Review = {
       id: string;
       author: string;
       rating: number;
       title?: string;
       content: string;
       createdAt: string;
     }
     ```
   * Only approved reviews.
   * Sorted by newest first.
   * Dummy if no DB data exists.

3. **Implement `getRecommendedProducts(productId)`**

   * Fetch products in the same category/brand/gender.
   * Limit: 4–6.
   * Must return: ID, title, price, main image.
   * Gracefully skip products with invalid/missing images.

4. **Page Implementation (`page.tsx`)**

   * Server component.
   * Read `{ params: { id } }`.
   * Call `getProduct(id)`.

     * If `null`, render a styled custom Not Found block.
   * Render:

     * **Gallery** (client component).
     * **Variant picker** (client, UI-only).
     * **Meta info** (server).
   * Wrap Reviews + Also Like in `Suspense` with skeleton fallback.

5. **Reviews Component**

   * Server-rendered.
   * Display stars (Lucide `Star`).
   * Collapsible text for longer reviews.
   * Show first 10 reviews.

6. **Also Like Component**

   * Server-rendered.
   * Grid of existing `Card.tsx`.
   * Cards link to `/products/[id]`.
   * Hide if list empty or invalid.

7. **Navigation**

   * Clicking product cards across the app leads to `/products/[id]`.

8. **Responsiveness & Design**

   * Desktop: pixel-perfect to screenshot.
   * Mobile/Tablet: strictly follow provided layouts.
   * Product gallery on mobile:

     * Main image at top.
     * Thumbnails scrollable below.
     * Rest of content flows in single column.

9. **Accessibility**

   * Semantic HTML.
   * Alt text for images.
   * Keyboard support for gallery thumbnails and swatches.

## 📦 Output Requirements

* Clean and well-typed server actions:

  * `getProduct(productId)`
  * `getProductReviews(productId)`
  * `getRecommendedProducts(productId)`

* `page.tsx` server-rendered PDP that:

  * Fetches product.
  * Shows reviews + recommendations via `Suspense`.
  * Handles missing products gracefully.
  * Renders gallery only if valid images exist.

* Pixel-perfect UI at all breakpoints.

* Consistent theme usage (`globals.css`).

* Clear separation of **server vs client** components.

* Super clean, easy-to-read code with proper naming.

## 📝 Notes

* Do not touch DB schemas.
* Use Drizzle relations properly — no hacks.
* All server actions must have **explicit TypeScript return types**.
* Use `next/image` with `sizes` + defined width/height to prevent layout shifts.
* Keep logic modular and reusable (avoid bloated components).
* The PDP should be **future-proof** so cart/favorite logic can be added later with minimal refactor.