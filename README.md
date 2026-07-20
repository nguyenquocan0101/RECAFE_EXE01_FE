<div align="center">

# RE:CAFÉ Storefront

**A warm, product-led storefront for a circular coffee brand.**

React + TypeScript frontend for browsing products, personalizing selected items, checking out, reviewing completed purchases, and moderating customer feedback.

<br />

`React 18` · `TypeScript` · `Vite` · `Tailwind CSS v4` · `React Three Fiber`

</div>

## Experience map

```text
Home                  Brand story and sustainability narrative
Products              Catalog, filters, availability, and product cards
Product detail        Gallery, 3D preview, purchase actions, and reviews
Checkout              Address, coupon preview, payment, and order creation
Profile               Account, addresses, order history, and review actions
Admin                 Orders, catalog, users, vouchers, and review moderation
```

## Highlights

- ReCafe Green Deck visual language: coffee brown, recycled green, warm neutrals, and Be Vietnam Pro.
- Responsive product catalog and detail pages with a lightweight, content-first layout.
- Product customization and optional 3D model viewing with React Three Fiber.
- Checkout with cart selection, coupon preview, multiple payment methods, and SePay demo polling.
- Customer reviews from completed orders only: stars, comments, photos, video, delete/recreate flow.
- Product review summaries with rating distribution, filters, verified-purchase state, media, and pagination.
- Admin-only review moderation with visibility filtering and media preview.
- Vietnamese and English locale files with the shared `useLanguage` context.

## Related API

This frontend consumes the companion backend:

**[EXE02_Backend_RE-CAFE](https://github.com/nguyenquocan0101/EXE02_Backend_RE-CAFE)**

During local development, `/api` requests are proxied by Vite to the configured API host in [`vite.config.ts`](vite.config.ts). For a local backend, point the proxy target at your local API or set `VITE_API_URL` where the API helper supports it.

## Requirements

- Node.js 20+ recommended
- npm
- The RE:CAFÉ backend running locally or reachable through the configured API proxy

## Quick start

```bash
git clone https://github.com/nguyenquocan0101/RECAFE_EXE01_FE.git
cd RECAFE_EXE01_FE
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Production build:

```bash
npm run build
npm run preview
```

## Environment

Create `.env.local` only when you need to override the default API behavior:

```env
VITE_API_URL=/
```

Do not commit `.env.local`, tokens, API keys, or payment credentials.

## Project structure

```text
src/
├── api and services      HTTP clients for customer and Admin APIs
├── components/           Shared layout, auth, profile, product, and review UI
├── context/              Auth, cart, language, and toast state
├── layouts/              Main storefront and Admin shells
├── locales/              Vietnamese and English copy
├── pages/                Storefront, checkout, profile, and Admin routes
├── styles/               Green Deck global design tokens and legacy surface styles
└── App.tsx               Route tree and protected route boundaries
```

## Review experience

The review flow is intentionally tied to a completed purchase:

1. A customer opens **Profile → Order history**.
2. A review action appears only for products in a `Completed` order.
3. The form accepts a 1–5 star rating, an optional comment, up to 2 images and 1 video.
4. The browser sends one `multipart/form-data` request; the backend owns validation and Cloudinary upload.
5. A customer cannot edit a review. They delete it and create a replacement.
6. Product pages display visible reviews immediately; Admin can hide inappropriate content without deleting it.

Media limits:

| Type | Limit |
| --- | --- |
| Images | Maximum 2 files, 10 MB each |
| Video | Maximum 1 file, 50 MB |
| Total | Maximum 3 files |

## Coupon experience

Checkout calls `POST /api/coupons/preview` with the current cart item IDs. The UI translates backend business errors into customer-facing copy, including invalid/inactive, expired, exhausted, minimum subtotal, and product-scope messages.

The frontend does not treat every `400` as “voucher không tồn tại”: HTTP 400 is the status, while the backend message identifies the actual business reason.

## Design notes

Read [`DESIGN.md`](DESIGN.md) before changing a visual surface. Keep these conventions intact:

- Primary action: `#657b35`; hover: `#798e3a`.
- Coffee text: `#4b2311`; supporting text: `#68361c` / `#9c7a65`.
- Warm border: `#e8ddd5`.
- Use the shared `Modal`, `Button`, and context providers before introducing new primitives.
- Keep keyboard focus visible and interactive targets at least 44px where practical.
- Prefer real loading, empty, error, and success states over silent failures.

## Verification

```bash
npm run build
```

Before shipping a UI change, manually check:

- 390px-wide mobile layout and desktop layout.
- Keyboard focus through forms and modal actions.
- Loading, empty, error, success, and disabled states.
- Vietnamese and English copy expansion.
- Authenticated and unauthenticated states.

## Related docs

- [`DESIGN.md`](DESIGN.md) — visual system and interaction direction
- [`FE_3D_CUSTOMIZATION_MVP.md`](FE_3D_CUSTOMIZATION_MVP.md) — customization surface notes
- [`FE_VOUCHER_PRODUCT_SCOPE_FLOW.md`](FE_VOUCHER_PRODUCT_SCOPE_FLOW.md) — coupon contract and flow
- Backend API: [EXE02_Backend_RE-CAFE](https://github.com/nguyenquocan0101/EXE02_Backend_RE-CAFE)

<div align="center">

Designed around the idea that waste can become worth.

</div>
