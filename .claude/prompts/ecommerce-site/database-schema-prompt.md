You are a senior full-stack engineer assigned to build a modern web application from scratch.

## 💼 Objective

Design and implement robust, normalized **database schemas** using **Drizzle ORM** for a scalable eCommerce application. This includes user accounts, product catalog, filters, reviews, orders, and supporting features,  all aligned with industry best practices for long-term scalability and clean code architecture.

## 🧰 Structure

- Tech Stack:
  - **ORM**: Drizzle ORM
  - **Database**: PostgreSQL (hosted on Neon Serverless)
  - **Language**: TypeScript
  - **Validation**: Zod schema integration
- Folder & File Structure:
	/lib
	└── db
	    ├── schema/
	    │   ├── addresses.ts
	    │   ├── products.ts
	    │   ├── variants.ts
	    │   ├── categories.ts
	    │   ├── collections.ts
	    │   ├── orders.ts
	    │   ├── carts.ts
	    │   ├── reviews.ts
	    │   ├── filters/
	    │   │   ├── genders.ts
	    │   │   ├── colors.ts
	    │   │   ├── sizes.ts
	    │   └── index.ts

## ✅ Tasks

0. Clean already existing schemas from `lib/db/schema.ts` file and delete that file.  
1. **Define Schema Files**
 - Implement Drizzle ORM schemas for the following entities:
   - Addresses
     ```
		  id: uuid (pk)
		  user_id: uuid (fk -> user.id)
		  type: enum('billing', 'shipping')
		  line1: string
		  line2: string
		  city: string
		  state: string
		  country: string
		  postal_code: string
		  is_default: boolean
	  ```
   - Products
     ```
		  id: uuid (pk)
		  name: string
		  description: text
		  category_id: uuid (fk -> categories.id)
		  gender_id: uuid (fk -> genders.id)
		  brand_id: uuid (fk -> brands.id)
		  is_published: boolean
		  default_variant_id: uuid (nullable, fk -> product_variants.id)
		  created_at: timestamp
		  updated_at: timestamp
		 ```
   - Categories
     ```
		  id: uuid (pk)
		  name: string
		  slug: string (unique)
		  parent_id: uuid (nullable, fk -> categories.id)
     ```
   - Product Variants
     ```
		  id: uuid (pk)
		  product_id: uuid (fk -> products.id)
		  sku: string (unique)
		  price: numeric(10, 2)
		  sale_price: numeric(10, 2) nullable
		  color_id: uuid (fk -> colors.id)
		  size_id: uuid (fk -> sizes.id)
		  in_stock: int
		  weight: float
		  dimensions: jsonb  // { length, width, height }
		  created_at: timestamp
     ```
  - Product Images
     ```
		  id: uuid (pk)
		  product_id: uuid (fk -> products.id)
		  variant_id: uuid (nullable, fk -> product_variants.id)
		  url: string
		  sort_order: int default 0 // for gallery ordering
		  is_primary: boolean
     ```
   - Genders
     ```
		  id: uuid (pk)
		  label: string  // e.g., "Men"
		  slug: string   // e.g., "men"
     ```
   - Brands
     ```
		  id: uuid (pk)
		  name: string  // e.g.,  “Nike”, “Adidas”
		  slug: string   // e.g., "men"
		  logo_url: string // optional
     ```
   - Colors
     ```
		  id: uuid (pk)
		  name: string       // "Red"
		  slug: string       // "red"
		  hex_code: string   // "#FF0000"
		 ```
   - Sizes
     ```
		  id: uuid (pk)
		  name: string       // "M"
		  slug: string       // "m"
		  sort_order: int    // for ordering: S < M < L
		 ```
   - Reviews
     ```
			id: uuid (pk)
		  product_id: uuid (fk -> products.id)
		  user_id: uuid (fk -> user.id)
		  rating: int (1-5)
		  comment: text
		  created_at: timestamp
     ```
   - Carts
     ```
		  id: uuid (pk)
		  user_id: uuid (nullable, fk -> user.id) // for guests: null
		  guest_id: string (nullable, fk -> guest.id) // 
		  created_at: timestamp
		  updated_at: timestamp
     ```
   - Cart Items
     ```
		  id: uuid (pk)
		  cart_id: uuid (fk -> carts.id)
		  product_variant_id: uuid (fk -> product_variants.id)
		  quantity: int
     ```
   - Orders
     ```
		  id: uuid (pk)
		  user_id: uuid (fk -> user.id)
		  status: enum('pending', 'paid', 'shipped', 'delivered', 'cancelled')
		  total_amount: numeric(10, 2)
		  shipping_address_id: uuid (fk -> addresses.id)
		  billing_address_id: uuid (fk -> addresses.id)
		  created_at: timestamp
     ```
   - Order Items
     ```
		  id: uuid (pk)
		  order_id: uuid (fk -> orders.id)
		  product_variant_id: uuid (fk -> product_variants.id)
		  quantity: int
		  price_at_purchase: numeric(10, 2)
		 ```
   - Payments
     ```
		  id: uuid (pk)
		  order_id: uuid (fk -> orders.id)
		  method: enum('stripe', 'paypal', 'cod')
		  status: enum('initiated', 'completed', 'failed')
		  paid_at: timestamp
		  transaction_id: string (nullable)
     ```
   - Coupons
     ```
		  id: uuid (pk)
		  code: string (unique)
		  discount_type: enum('percentage', 'fixed')
		  discount_value: numeric
		  expires_at: timestamp
		  max_usage: int
		  used_count: int
     ```
   - Wishlists
     ```
		  id: uuid (pk)
		  user_id: uuid (fk -> user.id)
		  product_id: uuid (fk -> products.id)
		  added_at: timestamp
     ```
   - Collections
     ```
		  id: uuid (pk)
		  name: string       // "Summer '25"
		  slug: string       // "summer-25"
		  created_at: timestamp
     ```
   - Product–Collection relationships
     ```
		  id: uuid (pk)
		  product_id: uuid (fk -> products.id)
		  collection_id: uuid (fk -> collections.id)
     ```
 
2. **Data Modeling Best Practices**
 - Use accurate data types: `uuid`, `text`, `numeric`, `jsonb`, `timestamp`, `enum`, etc.
 - Define proper **foreign key relationships** using `relations()`.
 - Normalize the structure for referential integrity and scalability.
 - Include **constraints**: `unique`, `not null`, `default`, etc.
 - Use **snake_case** for database columns and **camelCase** in TypeScript.

3. **Validation & Typing**
 - Use Zod validation for each table.
 - Create proper enums and use them into the relevant schemas.

4. **Maintainability**
 - Keep schema files modular and readable.
 - Group related entities (e.g. `filters/`) logically.
 - Ensure compatibility with `drizzle-kit` migration tools.
 - Design to support future use in APIs (REST/tRPC), admin dashboards, and internal tooling.
 
5. **Seed**
	- Study the product-related schema (including any product, product_variants, categories, etc. that were or will be defined).
	- Create a `seed.ts` function that populates the database with 15 realistic Nike products with variants
	- Seeds filters (genders, colors, sizes), brand(s), categories, collections
	- Seed data should reflect proper foreign key relationships and follow any constraints
	- For each product randomize colors, multiple sizes, multiple variants and images per variant/color (for few).
	- Upload images from `public/shoes` to server using `fs` as static images to `static/uploads/...`
	- Log progress and errors clearly
	- Add `db:seed` script to `package.json`

## 📦 Output Requirements

- Fully typed Drizzle ORM schema definitions per table
- Zod-based validation for each insert/select
- Foreign keys and relations defined with `relations()`
- Clean file separation and index export
- Ready for production with no placeholder/mocked data

## 📝 Notes

- This will power a production-grade system.
- Focus on scalability, modularity, and clarity.
- Don’t include dummy data or test code.
- Code must be clean, reusable, and aligned with modern TypeScript best practices.