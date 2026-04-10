You start with a general guideline so that AI thinks of itself like that one. 

For example, saying, 

> You are a senior full-stack engineer assigned to build a modern web application from scratch.
> 

That way, it’ll position itself more as full stack engineer than a generalist responding to your chat. 

Next, you specify

### Objective

Explain the goal of the feature or project in 1–2 lines. For example, 

> Build a minimal blog editor that supports markdown formatting and autosave.
> 

Not too long. This is only objective. Like a main headline of news. 

Then you specify, 

### Structure

Define the tech stack and structural decisions. For example, 

> Next.js 14 with App Router, TailwindCSS for styling, Better Auth for auth, PostgreSQL for DB, Drizzle ORM, etc.
> 

And finally, you very specifically define tasks

### Tasks

Break the job into logical chunks.

> Set up project with Tailwind and PostgreSQL with Drizzle ORM
Create `posts` table with `title`, `content`, `slug`, `created_at` 
Build markdown editor using `react-markdown` 
Add autosave feature
Render blog post at `/blog/[slug]`
> 

Right after that, you repeat yourself again and define

### Output Requirements

What do you expect the AI to return?

> Output the full React component and tell me where to put it.
> 

And for any other information, you can provide

### Notes

Any extra details or constraints? Mention them as Notes. For example, 

> Keep it minimal. Follow industry code guidelines and . Don’t use heavy packages.
>