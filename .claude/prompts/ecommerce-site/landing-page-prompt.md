You are a senior full-stack engineer assigned to build a modern web application from scratch.

## 💼 Objective

Build three responsive UI components — a **Navbar**, a **Reusable Card**, and a **Footer** — based on provided designs. These components will be used across the application, so they must follow consistent styling, responsive layout, and adhere to the application's theme and type system.

## 🧰 Structure

- Use the tech stack present in project structure 
- Use typography and color palette defined in `src/app/globals.css`
- All icons and images to be pulled from the `public/` folder
- Folder Structure:
		/src
		├── components/
		│   ├── Navbar.tsx
		│   ├── Card.tsx
		│   ├── Footer.tsx

## ✅ Tasks

1. **Navbar**
 - Implement a responsive navigation bar
 - Include logo (from `/public`), links, and any mobile hamburger toggle
 - Use semantic HTML and accessibility best practices

2. **Reusable Card**
 - Create a generic card component accepting props (title, description, image, etc)
 - Support various use-cases of a shoe
 - Responsive and theme-compliant

3. **Footer**
 - Implement a footer with navigation links, social icons, and copyright
 - Should be responsive and mobile-first

4. **Styling**
 - Use Tailwind CSS for all styling
 - Match colors, fonts, spacing with what's defined in `globals.css`

5. **Code Quality**
 - Use TypeScript for all components
 - Ensure all components are properly typed and reusable
 - Follow DRY and modular principles

## 📦 Output Requirements

- 3 standalone components in `src/components/`:
	- `Navbar.tsx`
	- `Card.tsx`
	- `Footer.tsx`
- Responsive and fully styled
- Properly typed with props interfaces
- Using assets from `public/`
- Uses theme values from `globals.css`
- Code is clean, readable, and production-ready

## 📝 Notes

- Design reference has been attached (screenshots)
- No need to wire up actual links or logic, just focus on UI/UX
- Mobile-first responsiveness is critical
- Follow component naming conventions and file structure used throughout the app