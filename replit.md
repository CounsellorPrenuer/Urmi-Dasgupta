# Claryntia Website

## Overview

Claryntia is a premium wellness platform that combines career coaching, relationship healing, and holistic guidance. The application is a single-page React website showcasing services for students, professionals, and organizations seeking clarity in career direction, relationships, and emotional well-being. The platform integrates psychometric insights, energy healing, and subconscious reprogramming methodologies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing. The application currently implements a single-page layout with a home route and a 404 fallback.

**UI Component Library**: Shadcn UI (New York variant) provides the foundation for all UI components. This library offers unstyled, accessible components built on Radix UI primitives that can be customized with Tailwind CSS.

**Styling Approach**: 
- Tailwind CSS for utility-first styling
- Custom design system defined in `design_guidelines.md` specifying:
  - Color palette: Primary purple (#6A1B9A), accent orange (#FF9800), secondary blue (#03A9F4)
  - Typography: Playfair Display for headings, Inter for body text
  - Layout system with consistent spacing and responsive grid patterns
  - Premium aesthetic combining minimalism with soft gradients and glass-morphism effects

**State Management**: TanStack Query (React Query) for server state management with a centralized query client configuration.

**Animation**: Framer Motion for smooth transitions and scroll-triggered animations throughout the sections.

**Component Structure**: The home page is composed of modular section components:
- Hero, Stats, WhoWeHelp, ChangingLandscape, Methodology, Services, Founder, Packages, Testimonials, Blog, Mentoria, Contact, Footer

Each section uses intersection observers to trigger animations when scrolling into view.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**Development Setup**: The application uses Vite in middleware mode during development, allowing hot module replacement and seamless integration between the Express server and React frontend.

**Build Process**: 
- Client-side: Vite bundles the React application
- Server-side: esbuild bundles the Express server for production
- Output directory structure separates public assets from server code

**API Structure**: Minimal backend implementation with a placeholder route registration system. The current architecture supports future REST API endpoints prefixed with `/api`.

**Storage Layer**: An in-memory storage implementation (`MemStorage`) provides the foundation for data persistence. This abstraction allows easy migration to database-backed storage without changing the interface.

### Data Storage

**ORM**: Drizzle ORM configured for PostgreSQL (via Neon serverless database).

**Schema Design**: Currently defines a basic `users` table with:
- UUID primary keys (generated via PostgreSQL)
- Username and password fields
- Zod validation schemas for type-safe data insertion

**Migration Strategy**: Drizzle Kit manages database schema migrations with configuration pointing to a PostgreSQL connection via environment variable.

**Session Management**: Dependencies include `connect-pg-simple` for PostgreSQL-backed session storage, though session implementation is not yet active.

### Design System Integration

**Theme Configuration**: CSS custom properties define a comprehensive design token system supporting:
- Light mode color palette with semantic naming
- Elevation layers for hover/active states
- Automatic border computation for buttons
- Card, popover, and sidebar variants

**Accessibility**: Radix UI primitives ensure WCAG compliance with proper ARIA attributes, keyboard navigation, and focus management.

**Responsive Design**: Mobile-first approach with breakpoints at 768px (tablet) and 1024px (desktop). Layout patterns adapt from single-column on mobile to multi-column grids on larger screens.

### Build and Deployment

**Development Mode**: 
- Concurrent execution of Vite dev server integrated with Express
- TypeScript checking without emit
- Hot module replacement for rapid iteration

**Production Build**:
- Vite optimizes and bundles client assets
- esbuild bundles server code with external package references
- Single-command start script for production deployment

**Environment Configuration**: Database connection requires `DATABASE_URL` environment variable for PostgreSQL connection.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Comprehensive collection of unstyled, accessible UI primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, navigation-menu, popover, select, slider, tabs, toast, tooltip, etc.)
- **Shadcn UI**: Component architecture and styling patterns
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Touch-friendly carousel implementation
- **React Day Picker**: Calendar and date selection
- **Recharts**: Data visualization (included but not actively used)
- **Vaul**: Drawer component implementation
- **CMDK**: Command palette interface

### Animation and Interaction
- **Framer Motion**: Declarative animations and gesture handling
- **React Intersection Observer**: Scroll-based animation triggers

### Form Management
- **React Hook Form**: Form state management and validation
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries
- **Zod**: Schema validation and type inference

### Data Fetching
- **TanStack Query**: Server state synchronization and caching

### Database and ORM
- **Drizzle ORM**: Type-safe SQL query builder and migration tool
- **Neon Serverless**: PostgreSQL database provider optimized for serverless environments
- **Drizzle Zod**: Automatic Zod schema generation from Drizzle tables

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Autoprefixer**: Automatic vendor prefixing
- **Class Variance Authority**: Type-safe variant styling
- **Tailwind Merge**: Intelligent Tailwind class merging
- **clsx**: Conditional className composition

### Development Tools
- **Replit Plugins**: Development banner, error overlay, and cartographer for Replit environment
- **TypeScript**: Static type checking
- **Vite**: Build tool and dev server
- **esbuild**: Fast JavaScript bundler

### External Services Integration
- **Mentoria Platform**: Career guidance platform providing lifetime access to users (mentioned in content, integration details not in codebase)
- **Google Fonts**: Playfair Display and Inter font families loaded via CDN

### Asset Management
The application includes image assets for:
- Logo (`Screenshot_2025-10-04_122812-removebg-preview_1759562746476.png`)
- Founder profile (`IMG20240827160716 (2) - Urmi Dasgupta_1759562746478.jpg`)

All external dependencies support the premium wellness platform aesthetic while maintaining performance and accessibility standards.