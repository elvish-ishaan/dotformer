This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

The frontend application uses the following environment variables:

- `NEXT_PUBLIC_API_URL`: The base URL for the API, including the `/api` path prefix
  - Example: `https://api.dotformer.nafri.in/api` or `http://localhost:3001/api`
  - This variable already includes the `/api` path, so don't add it again in service calls

When using this environment variable in your code:

```typescript
// Correct usage - the API_URL already includes the /api prefix
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/list`);

// Incorrect usage - duplicates the /api path
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/list`);
```

For local development, you can copy `.env.example` to `.env.local` and update the values as needed.

## API Integration

The frontend application uses a hardcoded API URL `https://api.dotformer.nafri.in/api` for all service calls. This is configured directly in the service files rather than using environment variables.

When using the API in your code:

```typescript
// The API URL is already hardcoded in the service files
// You don't need to include the full URL in your calls
import { fileService } from "@/lib/services/fileService";

// Example usage
const result = await fileService.uploadFile(file);
```
