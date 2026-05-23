# Green Deck

## Overview
A bold, white-and-brown design system built for immersive audio experiences. Green Deck uses a green accents against white and brown surfaces to create an atmosphere that feels like a warm, natural interface — clean, focused, and alive. The aesthetic is minimal yet punchy, designed to keep content front and center while the UI recedes into warm neutral surfaces.

## Colors
- **Primary** (#657b35): Interactive highlights, play buttons, active states — Green Accent
- **Primary Hover** (#798e3a): Hover state for green elements, slightly brighter green
- **Secondary** (#925f3c): Secondary controls, inactive elements — Warm Brown
- **Neutral** (#68361c): Body text, secondary labels on white and brown backgrounds
- **Background** (#FFFFFF): Primary app background, clean white background
- **Surface** (#925f3c): Card surfaces, sidebar, elevated containers
- **Text Primary** (#4b2311): Headlines, track titles, primary content — Deep Brown
- **Text Secondary** (#68361c): Artist names, metadata, supporting text
- **Border** (#68361c): Subtle dividers, card edges on brown surfaces
- **Success** (#657b35): Reuses green — saved to library, successful actions
- **Warning** (#b2bc54): Offline mode indicator, storage warnings
- **Error** (#68361c): Playback errors, account issues, failed downloads

## Typography
- **Display Font**: Be Vietnam Pro — `font-family: "Be Vietnam Pro", sans-serif;` loaded from Google Fonts
- **Body Font**: Be Vietnam Pro — `font-family: "Be Vietnam Pro", sans-serif;` loaded from Google Fonts
- **Code Font**: JetBrains Mono — loaded from Google Fonts

Be Vietnam Pro is used throughout as a geometric sans-serif that provides the clean, modern feel of a circular typeface. Headlines use weights 700 and 800 with tight tracking for bold, punchy statements. Body text uses weight 400 and 500 for comfortable reading on white and brown backgrounds. Slightly increased line-height (1.5x) improves legibility against brown surfaces. Text uses brown tones on white surfaces and white/light contrast when placed on brown surfaces.

- **Hero**: Be Vietnam Pro 64px/72px, weight 800, tracking -0.03em
- **Page Title**: Be Vietnam Pro 32px/40px, weight 700, tracking -0.02em
- **Section Title**: Be Vietnam Pro 24px/32px, weight 700, tracking -0.01em
- **Card Title**: Be Vietnam Pro 16px/22px, weight 700
- **Body**: Be Vietnam Pro 14px/22px, weight 400
- **Body Small**: Be Vietnam Pro 12px/18px, weight 400
- **Label**: Be Vietnam Pro 11px/16px, weight 700, tracking 0.1em, uppercase
- **Caption**: Be Vietnam Pro 11px/16px, weight 400
- **Code**: JetBrains Mono 13px/20px, weight 400

## Elevation
On white and brown interfaces, elevation is communicated through surface color and subtle shadows. Elevation is instead communicated through surface brightness — white surfaces (#FFFFFF) are lower, brown surfaces (#925f3c, #68361c) are higher. Level 0 uses #FFFFFF (background). Level 1 uses #925f3c (cards, sidebar). Level 2 uses #68361c (dropdown menus, context menus). Level 3 uses #4b2311 (modals, now-playing bar). Hover states lighten the surface by one level. The now-playing bar uses a subtle top border of 1px #68361c plus a gradient shadow: 0 -8px 24px rgba(0,0,0,0.5).

## Components
- **Buttons**: Primary is #657b35 fill, brown text (#4b2311), 32px height, 32px horizontal padding, 9999px border-radius (pill), Be Vietnam Pro 14px weight 700, tracking 0.05em uppercase. Hover scales to 1.04 with #798e3a fill. Secondary has 1px #925f3c border, transparent fill, brown text. Ghost button is text-only in #68361c, hover turns deep brown. Play button is circular, 48px, #657b35, white triangle icon.
- **Cards**: #925f3c background, 8px border-radius, no border. Artwork fills top with 8px top radius. Content area has 16px padding. Title in white 16px weight 700, subtitle in #68361c 14px. Hover state lightens background to #68361c with 200ms ease. Play button appears on hover, absolute positioned over artwork bottom-right with Level 2 shadow.
- **Inputs**: 40px height, #68361c background, 4px border-radius, 12px horizontal padding, #68361c placeholder, brown text. No visible border. Focused state adds 1px #4b2311 border. Search input is 48px with magnifying glass icon in #68361c.
- **Chips**: Pill-shaped (9999px radius), #68361c background, brown text, Be Vietnam Pro 14px weight 400, 4px/12px padding. Selected state: #4b2311 background, #4b2311 text. Filter row scrolls horizontally.
- **Lists**: Track rows are 56px height with 16px padding. Artwork thumbnail 40px, 4px radius. Track number/title/artist in columns. Duration right-aligned in #68361c. Hover shows #68361c background row. Active/playing track shows title in #657b35. Explicit badge is #68361c 9px uppercase label.
- **Checkboxes**: 16px square, 2px border-radius. Unchecked: 1px #925f3c border. Checked: #657b35 fill with white checkmark. Heart icon toggle uses outline for unsaved, filled #657b35 for saved.
- **Tooltips**: #68361c background, brown text, 4px border-radius, 8px/12px padding, Be Vietnam Pro 12px. Subtle 0 4px 12px rgba(0,0,0,0.4) shadow.
- **Navigation**: Left sidebar 240px wide, #4b2311 background. Logo top, nav links in #68361c 14px weight 700, active link in #4b2311. Playlist section scrollable below. Bottom now-playing bar 90px, #925f3c, full-width with track info left, controls center, volume right.
- **Search**: Top bar search, 48px height, #68361c background, 9999px border-radius, magnifying glass icon, Be Vietnam Pro 14px placeholder in #68361c. Results appear in dropdown overlay with #68361c background.

## Spacing
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Component padding: 16px standard, 24px for section headers
- Section spacing: 40px between major content sections, 16px between related groups
- Container max width: 1600px with 32px side margins, accounting for 240px sidebar
- Card grid gap: 24px (grid auto-fills with 180px min column width)

## Border Radius
- 2px: Track list items, small badges
- 4px: Inputs, artwork thumbnails, context menus
- 8px: Cards, modals, dropdown panels
- 12px: Large album art, playlist headers
- 9999px: Buttons, pills, chips, search bar, avatars, play button

## Do's and Don'ts
- Do design white-and-brown first — green is used as accent, not the main background
- Do use deep brown (#4b2311) for primary text on brown surfaces for maximum contrast
- Don't use the green for large surface fills — reserve it for interactive accents and the play button
- Do scale elements on hover (1.04x) for playful, responsive feedback
- Don't use borders to define containers — use surface color differences instead
- Do make the now-playing context persistent and always visible
- Don't use long text blocks — keep copy short, scannable, and label-like
- Do use uppercase tracking (0.1em) sparingly for section labels and overlines only
- Do keep the primary background white and use brown for structure