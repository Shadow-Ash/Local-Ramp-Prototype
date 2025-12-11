# Local Ramp BASE Chain - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from leading Web3 platforms (Coinbase, Uniswap, Rainbow Wallet) combined with marketplace patterns (Airbnb, LocalBitcoins) to create a trustworthy, professional P2P trading interface optimized for BASE Chain.

## Core Design Principles
1. **Trust & Security First**: Every interaction reinforces platform safety and BASE Chain reliability
2. **Mobile-First Web3**: Optimized for mobile crypto users while maintaining desktop functionality
3. **BASE Brand Consistency**: Strict adherence to BASE Chain visual identity throughout
4. **IRL-Focus Transparency**: Clear visual distinction that this is for in-person trading only

## Color System
**Light Mode**:
- Primary: BASE Blue (#0052FF)
- Background: White (#FFFFFF)
- Highlights: Pale blue (#E6EEFF)
- Text: Deep slate (#1A1D2E)

**Dark Mode**:
- Primary: BASE Blue (#0052FF)
- Background: Near Black (#0A0B14)
- Surface: Dark slate (#1A1D2E)
- Text: White with medium slate (#8B92A8) for secondary

**Functional Colors**:
- Success: Emerald green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Info: Cyan (#06B6D4)

## Typography
**Font Stack**: 
- Primary: Inter (via Google Fonts) - clean, modern, excellent readability
- Monospace: JetBrains Mono (for wallet addresses, transaction hashes)

**Hierarchy**:
- H1: 3xl (36px) / 2xl mobile - Hero headlines
- H2: 2xl (24px) / xl mobile - Section headers
- H3: xl (20px) / lg mobile - Card titles
- Body: base (16px) - Primary content
- Small: sm (14px) - Secondary info, timestamps
- Tiny: xs (12px) - Captions, legal text

**Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## Layout System
**Spacing Scale**: Tailwind units of 1, 2, 3, 4, 6, 8, 12, 16, 20, 24 for consistency
- Component padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)
- Section spacing: py-12 (mobile), py-16 (tablet), py-24 (desktop)
- Card gaps: gap-4 (mobile), gap-6 (desktop)

**Containers**:
- Max width: max-w-7xl for main content
- Tight content: max-w-2xl for forms, deal details
- Full bleed: Map views, hero sections

**Grid System**:
- Offers: 1 column mobile, 2 columns tablet, 3 columns desktop
- Stats/Features: 2 columns mobile, 4 columns desktop
- Forms: Single column with max-w-md centering

## Component Library

### Navigation
- **Header**: Sticky top navigation with wallet connection status, BASE logo, theme toggle
- Glass morphism effect with backdrop blur
- Mobile: Hamburger menu with slide-out drawer
- Wallet badge: Connected address (truncated) with BASE chain indicator

### Wallet Connection
- **Modal**: Centered with wallet options (MetaMask, Coinbase Wallet, WalletConnect)
- Each option: Large clickable card with icon, name, subtle hover lift
- BASE Chain verification banner prominently displayed
- Network mismatch: Full-screen warning overlay with switch-to-BASE CTA

### Offer Cards
- **Structure**: Image/placeholder top, content middle, action bottom
- Border: 1px in light mode, subtle glow in dark mode
- Hover: Subtle lift (translateY -2px), shadow increase
- Badge overlays: "Buy"/"Sell" pill (BASE blue), verification checkmark
- Footer: User avatar, truncated wallet address, BASE explorer link icon

### Map View
- **Pins**: Custom BASE-branded markers (blue with white "B")
- Selected pin: Enlarged with popup card preview
- Cluster indicators: Show count in BASE blue circle
- Controls: Floating zoom/locate buttons with glass effect

### Forms
- **Input Fields**: Rounded borders (rounded-lg), focus ring in BASE blue
- Labels: Above input with medium weight
- Helper text: Below in gray with xs size
- Error states: Red border, red text below
- Wallet addresses: Monospace font with copy button

### Buttons
**Primary**: BASE blue background, white text, rounded-lg, medium shadow
**Secondary**: Transparent with BASE blue border and text
**Danger**: Red background for destructive actions
**Sizes**: 
- Small: px-3 py-1.5, text-sm
- Medium: px-4 py-2, text-base
- Large: px-6 py-3, text-lg

### Badges & Pills
- **Chain Badge**: BASE blue with white text, small rounded-full
- **Status**: Success/warning/error colors with matching text
- **Verification**: Checkmark icon with "Verified" text

### Modals & Overlays
- **Backdrop**: Semi-transparent black with blur
- **Content**: Centered card with rounded-xl, max-w-lg
- **Close**: X button top-right with hover state
- **Actions**: Footer with button group (cancel left, confirm right)

### Data Display
- **Transaction History**: Table on desktop, stacked cards on mobile
- **Explorer Links**: Monospace hash (truncated) with external link icon
- **Timestamps**: Relative time ("2 hours ago") with tooltip showing absolute

### Safety Warnings
- **Banner Style**: Amber background, dark text, warning icon
- Prominent placement above critical actions (Create Offer, Initiate Deal)
- Text: "No escrow - IRL trading only. Meet in public places."

## Page-Specific Layouts

### Connect Wallet (Landing)
- Full-height hero with gradient background (BASE blue to dark)
- Centered content: Large "Connect to BASE Chain" headline
- Wallet options grid below
- Footer: "Why BASE Chain?" expandable panel

### Dashboard
- Top stats row: Cards showing active offers, completed deals, trust score
- Below: Tabbed interface (My Offers, Active Deals, History)
- Right sidebar (desktop): Quick actions, BASE chain status

### Create Offer
- Two-column layout (desktop): Form left, live preview right
- Mobile: Stacked with preview at bottom
- Buy/Sell toggle at top with large visual distinction
- Progressive disclosure: Advanced options collapsed by default

### Offer Browse
- Filter bar: Sticky below header with dropdown filters and search
- Toggle: Map view / List view (icons)
- Map: Full width with floating filter controls
- List: 3-column grid with infinite scroll

### Offer Detail
- Hero: Offer summary card with large Buy/Sell indicator
- Two-column: Details left, seller info + action right (desktop)
- Mobile: Stacked
- Footer: Safety banner and report link

### Admin Dashboard
- Left sidebar: Navigation menu (always visible desktop, collapsible mobile)
- Main: KPI cards at top, data tables below
- Charts: Full-width with BASE blue accent colors
- Action buttons: Consistent placement top-right

## Images

### Hero Images
**Connect Wallet Page**: Abstract illustration of BASE chain network visualization (blue nodes and connections on dark background) - full viewport height

**Dashboard**: No hero image - utility-focused interface

**Browse Offers**: Map integration (Mapbox/Leaflet) showing offer locations

**Help/FAQ**: Illustration of people meeting safely in public with crypto symbols - medium height (400px)

### Supporting Images
- **Avatar Placeholders**: BASE-themed geometric patterns as defaults
- **Empty States**: Friendly illustrations for no offers, no deals (BASE blue accent)
- **Tutorial Steps**: Simple icon-based graphics showing wallet connection flow

## Accessibility
- Minimum touch target: 44x44px for all interactive elements
- Focus indicators: 2px BASE blue outline with offset
- Color contrast: Meets WCAG AA for all text
- Screen reader: Proper ARIA labels for wallet addresses, transaction hashes
- Keyboard navigation: Full support with visible focus states

## Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

## Animations (Minimal)
- Page transitions: Subtle fade (200ms)
- Button interactions: Scale on press (0.98)
- Card hovers: Lift with shadow (300ms ease)
- Modal entry: Fade + scale from 0.95 (250ms)
- Toast notifications: Slide in from top (300ms)

**No**: Scroll-triggered animations, parallax, auto-playing carousels

## Icons
**Library**: Heroicons (outline for general UI, solid for filled states)
- Web3/Wallet: Custom BASE logos provided via static assets
- All icons: 20x20px default, 24x24px for emphasis
- Consistent stroke width across all icons

This design system creates a professional, trustworthy Web3 marketplace that emphasizes BASE Chain branding while maintaining excellent usability for IRL P2P trading.