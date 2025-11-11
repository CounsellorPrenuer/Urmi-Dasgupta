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
  - Typography: Playfair Display for all text (headings and body)
  - Layout system with consistent spacing and responsive grid patterns
  - Premium aesthetic combining minimalism with soft gradients and glass-morphism effects

**State Management**: TanStack Query (React Query) for server state management with a centralized query client configuration.

**Animation**: Framer Motion for smooth transitions and scroll-triggered animations throughout the sections.

**Component Structure**: The home page is composed of modular section components:
- Navbar (fixed navigation with logo, links, mobile menu)
- Hero, Stats, WhoWeHelp, ChangingLandscape, Methodology, Services, Founder, Packages, Testimonials, Blog, Mentoria, Contact, Footer

Each section uses intersection observers to trigger animations when scrolling into view.

**Navigation**: Fixed navbar component with:
- Logo and brand name with hover animation
- Desktop navigation links (Services, Packages, About, Blog, Contact)
- Mobile hamburger menu with animated slide-down panel
- Scroll-based background effect (transparent to glass-morphism)
- Smooth scroll-to-section functionality
- Full accessibility support (ARIA labels, keyboard navigation)
- CTA button for quick booking access

**Testimonials Display**: Infinite scrolling carousel component featuring:
- Avatar component displaying profile pictures or initials fallback
- Profile pictures loaded from object storage when available
- Fallback to initials (first letters of name) with gradient background (purple to blue)
- Purple border (2px) around all avatars for brand consistency
- Star rating visualization (1-5 stars)
- Smooth horizontal scroll animation with pause on hover
- Real-time data fetching from testimonials API

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**Development Setup**: The application uses Vite in middleware mode during development, allowing hot module replacement and seamless integration between the Express server and React frontend.

**Build Process**: 
- Client-side: Vite bundles the React application
- Server-side: esbuild bundles the Express server for production
- Output directory structure separates public assets from server code

**API Structure**: REST API endpoints prefixed with `/api`:
- Authentication:
  - `POST /api/auth/login` - Admin login with username/password
  - `POST /api/auth/logout` - Logout and destroy session
  - `GET /api/auth/session` - Check current session
- Contact Form:
  - `POST /api/contact` - Contact form submission endpoint with Zod validation
  - `GET /api/contact` - Retrieve all contact submissions (requires admin authentication)
- Testimonials:
  - `GET /api/testimonials` - Get all testimonials (public)
  - `POST /api/testimonials` - Create testimonial (requires admin authentication)
  - `GET /api/testimonials/:id` - Get single testimonial
  - `PUT /api/testimonials/:id` - Update testimonial (requires admin authentication)
  - `DELETE /api/testimonials/:id` - Delete testimonial (requires admin authentication)
  - `POST /api/admin/seed-testimonial-photos` - Backfill profile photos from stock images (requires admin authentication, idempotent)
- Blogs:
  - `GET /api/blogs` - Get all blogs (public)
  - `POST /api/blogs` - Create blog (requires admin authentication)
  - `GET /api/blogs/:id` - Get single blog
  - `PUT /api/blogs/:id` - Update blog (requires admin authentication)
  - `DELETE /api/blogs/:id` - Delete blog (requires admin authentication)
- Packages:
  - `GET /api/packages` - Get all packages (public)
  - `POST /api/packages` - Create package (requires admin authentication)
  - `GET /api/packages/:id` - Get single package
  - `PUT /api/packages/:id` - Update package (requires admin authentication)
  - `DELETE /api/packages/:id` - Delete package (requires admin authentication)
- Payment Tracking:
  - `GET /api/payments` - Get all payment records (requires admin authentication)
  - `POST /api/payments` - Create payment record (public)
  - `GET /api/payments/:id` - Get single payment (requires admin authentication)
  - `PUT /api/payments/:id` - Update payment status (requires admin authentication)
  - `DELETE /api/payments/:id` - Delete payment (requires admin authentication)

**Storage Layer**: PostgreSQL database storage implementation (`DatabaseStorage`) with full CRUD operations for all entities. The storage layer uses Drizzle ORM for type-safe database queries and Neon serverless PostgreSQL for hosting.

**Contact Form System**: Full-featured contact form in the Contact section with:
- React Hook Form with Zod validation for all fields (name, email, phone, purpose, message)
- Backend API integration storing submissions in PostgreSQL database
- Success/error toast notifications
- Automatic form reset after successful submission
- Comprehensive test coverage and accessibility support

**Admin Dashboard**: Secure administrative interface for managing website content:
- **Authentication**: Session-based authentication using express-session with PostgreSQL storage
  - Admin credentials configured via environment variables: `ADMIN_USERNAME` and `ADMIN_PASSWORD`
  - Session secret configured via `SESSION_SECRET` environment variable (required in production)
  - Admin user automatically created on first server startup with provided credentials
  - Secure password hashing using bcrypt (10 salt rounds)
  - Protected routes with authentication middleware
  - Production deployment requires all three environment variables to be set
- **Dashboard Layout**: Shadcn sidebar navigation with the following sections:
  - Testimonials management (create, read, update, delete)
  - Blogs management (create, read, update, delete)
  - Packages management (create, read, update, delete)
  - Contact submissions viewing
  - Payment tracking and status management
- **Features**:
  - Full CRUD operations with form validation using React Hook Form and Zod
  - Real-time data updates using TanStack Query
  - Responsive tables for data display
  - Modal dialogs for create/edit operations
  - Success/error toast notifications
  - Logout functionality with session cleanup
  - Image upload support for testimonials and blogs using ObjectUploader component
    - Testimonial profile pictures stored in object storage
    - Blog featured images with migration endpoint for production fixes
    - Automatic URL normalization to `/objects/` prefix
  - Testimonial photo seeding feature:
    - "Backfill Photos" button in Testimonials admin to assign stock profile photos
    - Uses deterministic naming: `testimonial-{id}.jpg` in private object storage
    - Stores simple URLs: `/objects/testimonial-{id}.jpg` (download handler adds private dir automatically)
    - Fully idempotent: checks existing URLs and object storage before uploading
    - Repairs broken references by re-uploading if object was deleted
    - Maps all 17 testimonials to appropriate stock images from attached_assets/stock_images
    - Comprehensive error tracking with detailed feedback to admin
    - Updates only imageUrl field to prevent data corruption
    - Production-ready with verified HTTP 200 responses and proper image delivery

### Data Storage

**ORM**: Drizzle ORM configured for PostgreSQL (via Neon serverless database).

**Schema Design**: Defines the following tables:
- `users` table: UUID primary keys, username and password fields (for admin authentication)
- `contact_submissions` table: UUID primary keys, name, email, phone, purpose, message, and createdAt timestamp
- `testimonials` table: UUID primary keys, name, role, content, rating (1-5), imageUrl (optional), and createdAt timestamp
- `blogs` table: UUID primary keys, title, excerpt, content, author, imageUrl (optional), and createdAt timestamp
- `packages` table: UUID primary keys, name, description, price, duration, features array, and createdAt timestamp
- `payment_tracking` table: UUID primary keys, name, email, phone, packageId, packageName, status, and createdAt timestamp
- Zod validation schemas for type-safe data insertion using `drizzle-zod`

**Migration Strategy**: Drizzle Kit manages database schema migrations with configuration pointing to a PostgreSQL connection via environment variable.

**Session Management**: Uses `express-session` with `connect-pg-simple` for PostgreSQL-backed session storage. Sessions are used for admin authentication and persist across server restarts.

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