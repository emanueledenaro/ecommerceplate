# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Commerceplate** is a Next.js 15.3+ e-commerce storefront built with Shopify Storefront API, Tailwind CSS 4.1+, and TypeScript. It's a production-ready template featuring server-side rendering, server actions for mutations, and full integration with Shopify's checkout and customer authentication systems.

## Development Commands

```bash
# Install dependencies
npm install

# Development server with Turbopack (http://localhost:3000)
npm run dev

# Production build
npm run build

# Serve production build for QA
npm start

# Linting
npm run lint

# Format code (Prettier with Tailwind CSS plugin)
npm run format

# Remove dark mode from the codebase
npm run remove-darkmode
```

**Important:** Always run `npm run lint` and `npm run format` before committing. The build command (`npm run build`) includes a post-build step that generates the sitemap via `next-sitemap`.

## Architecture & Key Patterns

### Directory Structure

- **`src/app/`**: Next.js App Router pages and layouts
  - Route groups: `(auth)` for login/sign-up pages
  - Dynamic routes: `[regular]` for markdown pages, `products/[slug]` for product details
  - API routes: `api/customer/` for authentication endpoints, `api/revalidate` for Shopify webhooks
  - **Single market**: the storefront targets Mexico only (`es-MX`, Shopify context `{country: MX, language: ES}` in `src/lib/i18n/config.ts`). There is no locale routing: next-intl serves `src/messages/es-mx.json` as the only message catalog, and legacy prefixes (`/mx`, `/it`, `/en`, `/es-mx`) are permanently redirected to unprefixed URLs via `next.config.js`.
- **`src/layouts/`**: Reusable template components, partials, and shortcodes
  - `components/`: Shared UI components (Header, Footer, Cart, NavUser, SearchBar, etc.)
  - `shortcodes/`: MDX components for content (Tabs, Accordion, Button, etc.)
  - `partials/`: Page-specific sections
- **`src/lib/`**: Core utilities and integrations
  - `shopify/`: All Shopify Storefront API interactions (queries, mutations, types)
  - `utils/`: Helper functions
  - `constants.ts`: Sorting options, tags, and hidden product configuration
- **`src/config/`**: Configuration files (`config.json`, `menu.json`, `social.json`, `theme.json`)
- **`src/types/`**: TypeScript type definitions
- **`src/content/`**: Markdown/MDX content files
- **`src/hooks/`**: Custom React hooks
- **`src/styles/`**: Global styles and Tailwind configuration
- **`public/`**: Static assets (images, product CSV for demo data)

### Shopify Integration

All Shopify interactions happen through `src/lib/shopify/index.ts`:

- **Data Fetching**: Server-side functions (`getProduct`, `getCollectionProducts`, `getCart`, etc.) use GraphQL queries to fetch from Shopify Storefront API
- **Mutations**: Cart operations (`addToCart`, `removeFromCart`, `updateCart`) and customer auth (`createCustomer`, `getCustomerAccessToken`) use GraphQL mutations
- **Caching**: Next.js 15 cache tags (`TAGS.products`, `TAGS.collections`, `TAGS.cart`) enable granular revalidation
- **Webhooks**: `app/api/revalidate` listens for Shopify webhook events and invalidates cache tags when products/collections change

**Environment Variables** (required in `.env.local`):
- `SHOPIFY_STORE_DOMAIN`: Your Shopify store domain
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: Storefront API access token
- `SHOPIFY_API_SECRET_KEY`: Used to verify webhook signatures

**Collections Configuration**: The homepage category slider shows all Shopify collections. Collections starting with `hidden-` are filtered out from search/catalog pages.

### TypeScript Configuration

Path aliases in `tsconfig.json`:
```typescript
"@/components/*": "./src/layouts/components/*"
"@/shortcodes/*": "./src/layouts/shortcodes/*"
"@/helpers/*": "./src/layouts/helpers/*"
"@/partials/*": "./src/layouts/partials/*"
"@/*": "./src/*"
```

Strict mode is enabled. Avoid `any` types; use `unknown` with type narrowing instead.

### Next.js Configuration

- **Output**: `standalone` for optimized Docker/serverless deployments
- **Base path**: Configurable via `config.json`
- **Images**: Remote patterns enabled for `cdn.shopify.com`
- **Transpilation**: `next-mdx-remote` is transpiled for ES module compatibility

## Shopify-Specific Workflows

### Product Data Flow

1. Products are fetched via `getProducts` or `getCollectionProducts` from `src/lib/shopify/index.ts`
2. Data is "reshaped" (edges/nodes removed, images processed) for easier consumption
3. Products tagged with `HIDDEN_PRODUCT_TAG` (`"nextjs-frontend-hidden"`) are filtered out
4. Components consume reshaped data with proper TypeScript types from `src/lib/shopify/types.ts`

### Cart Management

- Cart ID is stored in cookies
- Cart operations use optimistic updates on the client
- Server actions in `src/lib/shopify/index.ts` handle mutations
- Cart components: `Cart` (main cart UI), `AddToCart` (product page button)

### Authentication

- Customer authentication uses Shopify Customer Account API
- Login/signup pages: `src/app/(auth)/login` and `src/app/(auth)/sign-up`
- API routes: `src/app/api/customer/login` and `src/app/api/customer/sign-up`
- Access tokens are stored securely and used to fetch user details via `getUserDetails`

### Cache Revalidation

When products or collections change in Shopify:
1. Shopify sends webhook to `/api/revalidate?secret=<SHOPIFY_API_SECRET_KEY>`
2. Webhook handler validates secret and topic
3. Appropriate tags (`TAGS.products` or `TAGS.collections`) are revalidated
4. Next.js automatically refetches data on next request

## Code Quality Standards

Follow the principles documented in `AGENTS.md`:

- **DRY**: Extract shared logic after second occurrence
- **KISS**: Keep solutions simple; avoid over-engineering
- **YAGNI**: Implement only current requirements
- **SOLID** (adapted for React/TypeScript):
  - Single Responsibility Principle: Components/hooks should have one clear purpose
  - Open/Closed: Extend via composition/props, not by modifying stable contracts
  - Dependency Inversion: Depend on abstractions, not concrete implementations

### Naming Conventions

- Components: `PascalCase` (e.g., `ProductCard.tsx`)
- Hooks: `camelCase` starting with `use` (e.g., `useCart.ts`)
- Routes: `kebab-case` (e.g., `sign-up/`)
- Files/folders: Follow Next.js App Router conventions

### TypeScript Guidelines

- Enable `strict` mode (already configured)
- No `any` types without explicit justification
- Prefer union types over enums
- Use `satisfies` operator for type validation
- Mark arrays/objects as `readonly` where appropriate
- Don't expose internal implementation types in public APIs

### React/Next.js Best Practices

- Functional components only
- Extract logic into composable hooks
- Avoid duplicated derived state
- Use effects only for real side-effects (not data transformation)
- Mark components as `"use client"` only when necessary (prefer Server Components)
- Stable keys in lists
- Accessibility: proper alt text, ARIA labels, focus management

## Testing & Validation

- **Manual testing**: Run `npm run dev` and verify catalog, cart, and checkout flows
- **Build validation**: Run `npm run build` when changing runtime logic, shared types, or public APIs
- **No automated tests**: This project uses manual QA; describe test cases in PR descriptions

## Commit Conventions

Use Conventional Commits with scope:
```
feat(shopify): add product filtering by vendor
fix(cart): resolve quantity update race condition
refactor(header): extract HeaderTopBar component
docs(agents): update DoD checklist
chore(deps): upgrade next to 15.3.0
```

Group related changes in a single commit and reference issues in the body (`Refs #123`).

## Pull Request Checklist

See `AGENTS.md` for full Definition of Done. Key points:

- Functionality: All acceptance criteria met, critical flows working
- Code quality: No duplication, clear naming, short functions, no dead code
- TypeScript: Strict mode passing, no unjustified `any`, types updated in `src/types`
- Shopify: New queries/mutations documented, consumer components updated
- Accessibility: Alt text, focus states, ARIA roles, consistent color contrast
- Security: No secrets in logs, new env vars documented with safe fallbacks
- Validation: `npm run lint` 0 errors, `npm run format` applied, `npm run build` succeeds
- Documentation: PR template filled, `docs/` updated if setup changes

## Visual Guidelines

- **Color palette**: Peach (`#FFE4C4`), Pink (`#FADADD`), accent Coral (`#FF7A59`)
- **Typography**: `font-primary` for headings, `font-secondary` for body text
- **Card styling**: `rounded-3xl shadow-lg/20` with hover effects (`hover:-translate-y-1 transition-all`)
- Update `src/config/theme.json` when changing colors to maintain consistency

## Agent Communication

**All agent responses must be in Italian.** Keep messages concise, use file references with `path:line` format, and backticks for paths/commands.

## Additional Resources

- **Setup guide**: See README.md for Shopify partner account setup and token retrieval
- **Demo products**: Import from `public/products.csv` in Shopify admin
- **Documentation**: Internal docs in `docs/` for workflows, onboarding, and handoff procedures
