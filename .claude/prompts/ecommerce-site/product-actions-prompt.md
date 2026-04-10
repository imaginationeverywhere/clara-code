## 💼 Objective
Implement a high-performance backend server action to fetch products with full filtering, search, sorting, and pagination support.

This will power the product listing page of the e-commerce platform, optimized for server-side rendering and SEO.

## ⚙️ Structure

- Use Next.js Server Actions with Drizzle ORM and PostgreSQL
- Place main logic in `/src/lib/actions/product.ts`
- Place query parsing helpers in `/src/lib/utils/query.ts`
- Query should support product variants, color-specific images, and generic images
- Render products server-side using `/src/components/Card.tsx`

All queries must be optimized to minimize joins and avoid N+1 queries


## ✅ Tasks

1. **Implement getAllProducts**

	- Accept a params object supporting:
		- Search (search)
		- Filters
		- Price range (priceMin, priceMax)
		- Sorting (sortBy=price_asc, sortBy=latest, etc.)
		- Pagination (page, limit)
	- Apply all filters and sorting in a single Drizzle ORM query
	- Ensure images are fetched in the same query
	- Return:
		- products: Product[] (with aggregated minPrice, maxPrice, and top images)
		- totalCount: number

2. **Implement getProduct**

	- Accept a `productId`
	- Fetch full details:
		- All product fields
		- Variants (with stock, size, color, price)
		- Category, Brand, Gender
		- All images
	- Ensure one query is used where possible with relations

3. **Update `/src/app/(root)/products/page.tsx`**

	- Make page.tsx a server component with an async function
	- Await searchParams before using their values
	- Parse filters using `/src/lib/utils/query.ts`
	- Call `getAllProducts(params)` and map results into Card components

4. **Create Query Utils in `/src/lib/utils/query.ts`**

	- `parseFilterParams(searchParams)` → maps URL params to a filters object
	- buildProductQueryObject(filters) → builds a Drizzle query object
	- Handle defaults & missing values gracefully


## 📦 Output Requirements

- `getAllProducts(filters)` returns correct product list with all filters applied
- `getProduct(productId)` returns complete details for PDP
- `/products/page.tsx`:
	- Waits for searchParams
	- Uses parsed params to call getAllProducts
	- Renders server-side with Card
- Must return color-specific images if color filter applied, otherwise return generic images
- Must be responsive and use `/src/app/globals.css`


## 📝 Notes

- Use compound indexes for (brand_id, is_published), (category_id, is_published), (color_id, product_id) for performance
- Avoid loops. Use joins and aggregations
- Default sort: created_at DESC
- Make it future-proof for different scenarios
- Pagination must prevent over-fetching
- Ensure TypeScript types are explicit