---
name: Luminous Ledger
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#4de082'
  on-secondary: '#003919'
  secondary-container: '#00b55d'
  on-secondary-container: '#003e1c'
  tertiary: '#ffb3b0'
  on-tertiary: '#670211'
  tertiary-container: '#b33e41'
  on-tertiary-container: '#ffdedc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#6dfe9c'
  secondary-fixed-dim: '#4de082'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410006'
  on-tertiary-fixed-variant: '#881d24'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeric-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin-mobile: 20px
  container-margin-desktop: 40px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
  section-gap: 48px
---

## Brand & Style

The design system is engineered for a premium, high-fidelity expense-splitting experience that balances financial precision with social connectivity. The brand personality is modern, sophisticated, and authoritative, evoking a sense of trust through meticulous craftsmanship.

The visual style is **Dribbble-inspired Minimalism**, blending High-Contrast elements with subtle Glassmorphic details. The interface utilizes depth through layering rather than ornamentation, ensuring that complex financial data remains legible and aesthetically pleasing. The emotional response is one of clarity and control; the dark mode provides a focused, "command center" atmosphere for personal finances, while the light mode offers a crisp, refreshed view for granular transaction management.

## Colors

The palette is centered on high-contrast functionality. The **Primary Action** color is a vibrant 'Electric Violet' (#7C3AED), used for CTA buttons and interactive states. 

- **Positive Green (#4ADE80):** Exclusively reserved for credits, balances owed to the user, and successful transaction states.
- **Alert Red (#F87171):** Reserved for debts, overdue payments, and destructive actions.
- **Dark Mode:** Utilizes a 'Pure Black' (#000000) foundation for maximum contrast, with surfaces rendered in 'Deep Slate' (#0F172A) and 'Midnight' (#1E293B).
- **Light Mode:** Shifts to a 'Paper White' (#FFFFFF) background with subtle 'Cool Gray' (#F8FAFC) surfaces to maintain a clean, editorial feel.

Gradients should be used sparingly, primarily as subtle overlays on cards (e.g., a 10% opacity Violet-to-Transparent linear gradient) to provide a premium sheen in dark mode.

## Typography

This design system utilizes **Inter** to achieve a modern, iOS-inspired aesthetic. The hierarchy is strictly enforced to ensure financial figures are the primary focal point.

- **Headlines:** Use tight letter spacing (-0.02em) for large displays to create a high-end, editorial feel.
- **Numerics:** Specific attention is paid to financial figures; use Bold weights for balance displays.
- **Labels:** Small caps with increased tracking are used for secondary metadata (e.g., timestamps or "You are owed").
- **Scale:** On mobile, display sizes are aggressively stepped down to prevent wrapping, while maintaining the 600+ font-weight for visibility.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a base-8 spacing scale. 

- **Mobile:** A 4-column grid with 20px outside margins. Content cards typically span the full width to maximize readability of transaction details.
- **Desktop/Tablet:** A 12-column grid. The dashboard uses a "Main-Detail" split, where the left 8 columns handle the feed and the right 4 columns house the summary cards and quick-action widgets.
- **Padding:** Internal card padding is generous (24px) to reinforce the premium, minimalist aesthetic. Vertical stacks use 12px or 24px gaps to maintain a clear "breathing" rhythm between transaction groups.

## Elevation & Depth

Hierarchy is established differently across color modes:

- **Dark Mode:** Uses **Tonal Layering**. The background is #000000. Primary cards sit at +1dp using #0F172A with a 1px border of #FFFFFF (10% opacity). This creates a "floating glass" effect without heavy shadows that would muddy the dark background.
- **Light Mode:** Uses **Ambient Shadows**. Surfaces are #FFFFFF with a very soft, diffused shadow (0px 10px 30px rgba(0,0,0, 0.04)). The shadow has a slight tint of the primary color (#7C3AED) at 2% opacity to add warmth.
- **Backdrop Blurs:** Used for navigation bars and sticky headers, applying a 20px blur to the content beneath to maintain context during scroll.

## Shapes

The design system uses a high-radius shape language to feel approachable and modern.

- **Standard Elements:** 16px (0.5rem) for small cards and input fields.
- **Large Containers:** 24px (1.5rem) for main dashboard cards and bottom sheets.
- **Avatars:** Strictly circular (50% radius) to contrast against the rectangular geometry of the financial data.
- **Interactive States:** Buttons use the `rounded-lg` (16px) setting, while secondary "pill" chips use a full 100px radius for high distinction.

## Components

- **Buttons:** Primary buttons are Solid 'Electric Violet' with white text. In dark mode, they may feature a subtle top-inner-glow. Secondary buttons are "Ghost" style with a 1px border.
- **Cards:** Transaction cards feature a 3-column internal layout: [Circular Avatar] | [Title & Category] | [Amount & Status]. In dark mode, card borders are #FFFFFF (8% opacity).
- **Inputs:** Minimalist fields with no background; only a bottom border (2px) that illuminates to 'Electric Violet' upon focus. Labels float above in `label-caps`.
- **Chips:** Used for transaction categories (e.g., "Food", "Travel"). These use a low-opacity background of the category's assigned color with high-saturation text.
- **Circular Avatars:** Feature a 2px offset ring in the Primary Action color when a user has an active pending balance.
- **Progress Bars:** Thin (4px) bars used to show split-progress, using a 'Positive Green' fill against a dark slate track.