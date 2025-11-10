# Promo Hub - Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Mailchimp's accessible campaign builder and ConvertKit's clean dashboard aesthetics, combined with Apple's premium minimalism for a professional email marketing platform experience.

## Design Principles
- **Data clarity over decoration**: Email marketing is metrics-driven; present campaign stats, delivery rates, and provider usage clearly
- **Progressive disclosure**: Complex features (recipient mapping, provider distribution) revealed contextually
- **Spatial confidence**: Generous whitespace between major sections; premium doesn't mean cramped

## Color System
- **Primary**: #007C89 (Teal) - CTAs, active states, links
- **Secondary**: #FF6B35 (Orange) - Warnings, provider status indicators, accent elements
- **Background**: #F8FAFC (Light grey) - Page background, card containers
- **Surface**: #FFFFFF - Cards, modals, input fields
- **Text Primary**: #1E293B (Dark slate)
- **Text Secondary**: #64748B (Slate grey)
- **Success**: #10B981 (Green) - Successful sends, validations
- **Warning**: #F59E0B (Amber) - Daily limits approaching
- **Error**: #EF4444 (Red) - Failed sends, validation errors

## Typography
- **Font Stack**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif
- **Headings**: 
  - Page titles: 32px/semibold
  - Section headers: 24px/semibold
  - Card titles: 18px/medium
- **Body**: 15px/regular, 1.6 line-height
- **UI Labels**: 14px/medium
- **Captions**: 13px/regular, text-secondary color

## Layout System
**Spacing primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Card padding: p-6 to p-8
- Section margins: mb-8 to mb-12
- Input spacing: gap-4
- Button padding: px-6 py-3

## Component Library

### Navigation
**Sidebar (Desktop)**: 280px fixed width, background-white, border-right subtle grey
- Logo/brand at top (p-6)
- Nav items with icons (px-4 py-3, rounded-lg on hover)
- Active state: teal background with white text
- Bottom section: usage stats widget showing provider quotas

**Mobile**: Bottom tab bar with 4-5 key sections, persistent across views

### Dashboard Cards
- White background, rounded-xl, subtle shadow
- Header with title + action button (right-aligned)
- Stat cards: 3-column grid on desktop, stack on mobile
  - Large number (36px/bold)
  - Label below (14px/medium, text-secondary)
  - Trend indicator (small arrow icon + percentage)

### Email Builder Interface
**Split Layout**:
- **Left panel** (400px): Campaign form with collapsible sections
  - Sender Details
  - UTM Parameters (collapsed by default)
  - Each section: p-6, border-b
- **Right panel** (flex-1): GrapesJS canvas with toolbar
  - Top toolbar: white background, sticky, icons with labels
  - Preview toggles: Desktop/Mobile (segmented control)
  - Canvas: centered with max-width, subtle shadow

### Forms
- Input fields: h-11, rounded-lg, border-grey-300, focus:ring-2 ring-teal
- Labels: above inputs, 14px/medium, mb-2
- Helper text: 13px/regular, text-secondary, mt-1
- Validation errors: text-error, with small warning icon

### Recipient Management
**Upload Interface**:
- Drag-drop zone: dashed border, rounded-xl, p-12, hover state with teal border
- Column mapping table after upload:
  - 2-column layout: Source → Destination
  - Dropdown selectors for mapping
  - Preview rows showing 3-5 sample entries
- Validation summary: stat boxes showing valid/invalid/duplicate counts

### Send Interface
**Distribution Visualization**:
- Provider cards showing allocation:
  - Provider logo/name
  - Batch count + total emails
  - Daily usage bar (progress indicator)
  - Status badge (green/amber/grey)
- Progress section:
  - Large circular progress indicator (teal)
  - Real-time stats: Sent / Total
  - Log stream: scrollable list, newest on top, with timestamps

### Buttons
- **Primary**: teal background, white text, h-11, px-6, rounded-lg, semibold
- **Secondary**: white background, teal border, teal text
- **Ghost**: transparent, grey text, hover:background-grey-100
- All buttons: smooth hover transitions, subtle shadow on hover

### Templates Gallery
- Grid layout: 3 columns desktop, 2 tablet, 1 mobile
- Each card:
  - Thumbnail image (aspect-ratio-4/3)
  - Name + date below
  - Hover: overlay with Edit/Delete actions

## Responsive Behavior
- **Desktop** (1280px+): Full sidebar, split panels
- **Tablet** (768-1279px): Collapsible sidebar, single column for builder
- **Mobile** (<768px): Bottom nav, stacked layouts, full-width forms

## Images
**Hero Section**: Not applicable - this is a dashboard application, not a marketing site. Focus on data-rich dashboard landing.

**Icon Usage**: 
- Heroicons for UI actions and navigation
- Provider logos for SendPulse/Brevo/Mailjet (use official brand assets)
- Email preview thumbnails in templates section

## Micro-interactions
- Smooth transitions on all hover states (150ms ease)
- Button states: subtle scale on press (scale-98)
- Success states: gentle green fade-in
- Loading states: skeleton screens for data, spinners for actions
- Toast notifications for send confirmations (top-right, auto-dismiss)