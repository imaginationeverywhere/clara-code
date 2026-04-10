You are a senior full-stack engineer assigned to build a modern web application from scratch.

## 💼 Objective

Implement a fully functional and responsive **Cart System** that integrates with both authenticated users and guest sessions, keeping cart state consistent across all pages and sessions.

## ⚙️ Structure

* **Framework**: Next.js 14 (App Router)
* **Database ORM**: Drizzle ORM with PostgreSQL (schemas already exist, no modifications needed at all)
* **State Management**: Zustand (for cart global state)
* **Styling**: Tailwind CSS (strictly follow theme guidelines from `globals.css`)
* **Icons**: Lucide Icons
* **Auth & Sessions**: Guest + User session handling (already implemented in `src/lib/auth/actions.ts`)
* File folders

	/src
	├── app/
	│   ├── (root)/
	│   │   ├── cart/
	│   │   │   └── page.tsx              ← cart page (SSR + client integration)
	├── components/                       ← implement cart related components inside this folder
	├── lib/
	│   ├── auth/
	│   │   └── actions.ts                ← guest session + user session handling. It's already there. 
	│   ├── actions/
	│   │   └── cart.ts                   ← cart server actions (CRUD)
	│   └── utils/
	│       └── query.ts                  ← helpers for parsing/stringifying URL filters
	├── store/
	│   └── cart.store.ts                  ← Zustand cart global state
	


## ✅ Tasks

1. **Cart Page UI**

   * Build a cart page **strictly following the attached design screenshot**.
   * Ensure responsiveness across desktop, tablet, and mobile (main image/galleries handled as per responsive rules).
   * Follow consistent theme and component usage from existing codebase.

2. **Global State (Zustand)**

   * Create a cart global state in `src/store/cart.store.ts`.
   * Integrate cart state in navbar (cart indicator) and cart page.
   * Ensure updates are reflected instantly across pages when items are added/removed/updated.

3. **Server Actions (`src/lib/actions/cart.ts`)**

   * Implement the following **industry-standard named** server actions:

     * `getCart` – fetch all cart items for user/guest
     * `addCartItem` – add a product variant to cart
     * `updateCartItem` – update quantity/variant in cart
     * `removeCartItem` – remove item from cart
     * `clearCart` – empty cart (optional but recommended)
   * Ensure correct integration between global state and these server actions.

4. **Guest Session Handling**

   * If no user exists, create/maintain a guest session in cart flow.
   * If a user signs up/logs in after creating a guest session → merge guest session cart into user cart.
   * If user already logged in, proceed normally.

5. **Checkout Flow**

   * If a guest user clicks **Checkout**, redirect them to `/auth` page for login/signup.
   * After successful login/signup, merge guest session cart into user cart and continue.
   * If already logged in → proceed to checkout without interruption.

## 📌 Output Requirements

* Fully functional cart page (UI + global state + server actions).
* Cart state is **always consistent** across all pages and sessions.
* Works seamlessly for both guest and authenticated users.
* Follows **file/folder structure** and **theme guidelines** strictly.
* Code should be production-ready, clean, and maintainable.

## 📝 Notes

* Do not modify any existing DB schema.
* Ensure server action names follow **best practices** (`getCart`, `addCartItem`, `updateCartItem`, `removeCartItem`).
* Must use Lucide icons where necessary (cart icon, delete icon, etc.).
* Keep UI responsive across desktop, tablet, and mobile, following attached screenshots.