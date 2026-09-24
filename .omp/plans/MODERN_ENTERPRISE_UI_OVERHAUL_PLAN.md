# Modern Enterprise UI Overhaul for SIM-KAP

## Context
Transform SIM-KAP frontend from basic Tailwind styling to a polished, enterprise-grade UI inspired by modern Dribbble design trends (2024-2025). The goal is visual consistency across all pages, elevated design language with gradients, glassmorphism, smooth animations, and cohesive color system while maintaining full functionality.

**Target Style:** Clean minimal admin dashboard with 3D-style metric cards, crisp borders, subtle shadows, gradient accents, backdrop blur effects, floating elements, and professional corporate branding that matches Central Saga's green identity.

---

## Approach

### **Phase 1: Foundation & Design System Setup**

#### Step 1.1: Establish Global Design Tokens
**Target:** `frontend/app/globals.css`

Add comprehensive design token system for consistent theming:

```css
/* NEW SECTION - Add after existing :root */
:root {
  /* Enhanced color palette */
  --brand-primary: #0f766e;       /* Central Saga Green */
  --brand-secondary: #14b8a6;     /* Teal accent */
  --brand-accent: #0d9488;        /* Darker teal */
  
  /* Gradient definitions */
  --gradient-brand: linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%);
  --gradient-surface: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  --gradient-card: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  
  /* Shadow depths */
  --shadow-smooth: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-elevated: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-floating: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Rounded corners */
  --radius-xs: 0.375rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Glassmorphism utilities */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-shadow: 0 8px 32px 0 rgba(31 38 135 / 0.1);
  
  /* Animation timings */
  --duration-fast: 150ms;
   duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

**Verification:** Run dev server (`npm run dev`) → Check computed CSS variables in browser DevTools for any page.

#### Step 1.2: Create Shared Design Components
**Create new files:**

##### A. `frontend/components/ui/Card.tsx`
Modern card component with variants for different use cases:

```tsx
interface CardProps {
  variant?: 'elevated' | 'floating' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}
```

Features:
- Three preset variants with different shadow/depth levels
- Hover animations (translate-y + shadow increase)
- Responsive padding
- Optional border gradient on hover

##### B. `frontend/components/ui/Badge.tsx`
Unified badge system for status, grades, and labels:

```tsx
interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
```

Color mapping:
- Success: emerald-500/600 → emerald-100 text-emerald-800
- Warning: amber-500/600 → amber-100 text-amber-800
- Error: rose-500/600 → rose-100 text-rose-800
- Info: blue-500/600 → blue-100 text-blue-800

##### C. `frontend/components/ui/Button.tsx`
Centralized button styles with variants:

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}
```

Primary button gradient: `bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500`

**Acceptance:** Import and test components in a blank page before integrating into real pages.

---

### **Phase 2: Core Layout Enhancement**

#### Step 2.1: Redesign Sidebar Navigation
**Target:** `frontend/components/shared/Sidebar.tsx`

Changes:
1. Replace solid bg-slate-900 with gradient sidebar background:
   ```tsx
   className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
   ```

2. Enhance brand header section with logo glow effect:
   - Current logo already has `border-emerald-500/40 ring-emerald-500/20`
   - Add `animate-pulse` to ring for subtle breathing effect
   - Increase padding to `p-5` for better spacing

3. Update navigation menu items:
   - Active state: Add left accent bar (`w-1 h-full bg-emerald-500 rounded-r-lg ml-2`)
   - Hover state: Change from transparent to `hover:bg-white/10` with `translate-x-1` translate
   - Icon enhancement: Add `group-hover:text-emerald-400 transition-colors`
   - Text: Add `font-semibold group-hover:tracking-wide transition-all`

4. Bottom user profile section:
   - Convert to glassmorphic card: `bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3`
   - Avatar: Circular with avatar container (see Step 3.2)
   - Logout button: Add red gradient icon hover effect

**Lines to modify:** ~82-197 in current Sidebar.tsx

**Verification:** Navigate between pages, verify active nav indicator stays smooth, no flickering.

#### Step 2.2: Polish Navbar Component
**Target:** `frontend/components/shared/Navbar.tsx`

Changes:
1. Top header gradient background:
   ```tsx
   className="sticky top-0 z-30 h-16 bg-gradient-to-r from-white via-slate-50 to-white backdrop-blur-xl border-b border-slate-200/60 shadow-sm"
   ```

2. Search bar integration (new):
   - Add centered search input with Lucide search icon
   - Style: `bg-slate-100 border-none rounded-full px-4 py-2 w-80 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow hover:bg-slate-200`
   - Placeholder: "Search tasks, employees..."
   - Hotkey: Press `/` to focus (use useEffect)

3. User dropdown avatar:
   - Convert plain image to circular avatar with status dot
   - Status colors: online (emerald-500), busy (amber-500), offline (slate-400)
   - Dropdown menu: Glassmorphic design with backdrop-blur, soft shadows

4. Notification bell icon (future-proofing):
   - Add notification count badge if available from API
   - Pulse animation when unread notifications exist

**Lines to modify:** ~92-131 in current Navbar.tsx

**Verification:** Search bar filters correctly, avatar dropdown works smoothly, responsive on mobile.

---

### **Phase 3: Dashboard Page Transformation**

#### Step 3.1: Elevate Banner Header
**Target:** `frontend/app/(dashboard)/page.tsx` lines 73-117

Current banner is good but needs refinement:

1. Add particle/breathing background effect:
   ```css
   /* NEW CSS - Add to globals.css */
   @keyframes float {
     0%, 100% { transform: translateY(0) scale(1); }
     50% { transform: translateY(-10px) scale(1.05); }
   }
   
   .particle {
     animation: float 8s ease-in-out infinite;
   }
   ```
   Apply to existing absolute positioned blurred circles

2. Strengthen gradient flow:
   ```tsx
   className="p-8 bg-gradient-to-br from-teal-950 via-cyan-900 to-slate-900 text-white rounded-3xl shadow-2xl border border-teal-800/40 relative overflow-hidden"
   ```

3. Logo container enhancement:
   - Increase pulse animation speed slightly
   - Add subtle bounce on hover

4. Action buttons improvements:
   - Primary button: Add shimmer hover effect using pseudo-element
   - Secondary button: Add ripple click animation

**Verification:** Browser renders smooth animations, GPU acceleration enabled (check DevTools Performance tab).

#### Step 3.2: Refine Metric Cards
**Target:** `frontend/app/(dashboard)/page.tsx` lines 120-189

Current 4 stat cards already follow Dribbble style, but add polish:

1. Consistent glass overlay on all cards:
   ```tsx
   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
   ```

2. Icon container improvements:
   - Add `skew-x-[-6deg]` for dynamic 3D tilt
   - Enlarge to `w-14 h-14`
   - Icon glow effect: `drop-shadow-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`

3. Progress indicators below numbers:
   - For percentage cards, add mini progress bar (5px height)
   - Color-coded by grade (A=green, B=blue, C=yellow, D=orange, E=red)

4. Micro-interactions:
   - Click card → Trigger toast confirmation with value detail
   - Swipe/touch support for mobile devices

#### Step 3.3: Chart Section Modernization
**Target:** `frontend/app/(dashboard)/page.tsx` lines 195-421

1. Chart wrapper card:
   - Remove heavy borders, use lighter `border-slate-200/60`
   - Add inner highlight: `before:absolute before:inset-0 before:pointer-events-none before:bg-gradient-to-b before:from-white/20 before:to-transparent`

2. Chart type switcher buttons:
   - Transform to segmented control style (like iOS)
   - Selected state: Full gradient background, unselected: Outline only
   - Smooth transition between tabs

3. Radial chart enhancements:
   - Add legend with color-matched labels
   - Animated entry for each slice (staggered rotation)
   - Tooltips on hover showing exact percentages

**Alternative implementation note:** If Recharts library exists, ensure it's imported as default export `import { LineChart, BarChart, PieChart } from 'recharts'`, not named imports which can cause errors.

---

### **Phase 4: Tasks Page Beautification**

#### Step 4.1: Top Toolbar Makeover
**Target:** `frontend/app/(dashboard)/tasks/page.tsx`

Location: After metrics grid, before task display area (~line 400+)

1. Header section:
   ```tsx
   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
     <div>
       <h1 className="text-3xl font-black text-slate-900 tracking-tight">Task Management</h1>
       <p className="text-slate-500 mt-1">Track, assign, and review employee tasks</p>
     </div>
     <button
       onClick={() => setIsCreateOpen(true)}
       className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
     >
       <Plus className="w-5 h-5" />
       Create New Task
     </button>
   </div>
   ```

2. Filter toolbar redesign:
   - Container card with light gray background
   - Search bar: Rounded pill shape, grow on focus
   - Status dropdown: Custom styled select with chevron icon
   - View toggle: Icon-only buttons with filled state for active view

3. Sort controls:
   - Add dropdown menu instead of inline select
   - Options: "Last updated", "Created date", "Priority", "Due date"

#### Step 4.2: Task Display Modes

**Table View Enhancement** (~line 450+):

1. Table wrapper:
   ```tsx
   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
   ```

2. Table headers:
   ```tsx
   <th className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
   ```

3. Row interactions:
   - Hover: Slight lift (`hover:-translate-y-0.5 hover:shadow-md`)
   - Striped alternating rows for readability
   - Last action timestamp with relative time (e.g., "2 hours ago")

**Grid/Kanban View Enhancement**:

1. Task cards:
   - Gradient borders on priority levels (High=red, Medium=yellow, Low=green)
   - Due date badge with urgency color coding
   - Attachments indicator with icon count
   - Quick action buttons visible on hover (view, edit, submit)

2. Drag-and-drop support:
   - Integrate `react-beautiful-dnd` or native HTML5 DnD
   - Smooth drag preview with ghost effect
   - Drop zones with animated feedback

#### Step 4.3: Modal Dialog Polishing
**Target:** Existing modals + `frontend/components/ui/Modal.tsx`

1. Modal backdrop:
   - Darker overlay: `bg-slate-900/60` instead of `50`
   - Blur intensity: `backdrop-blur-sm`

2. Modal content:
   ```tsx
   className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden`}
   ```
   Add entrance animation: `animate-in fade-in zoom-in-95 duration-200`

3. Modal header:
   - Gradient background: `bg-gradient-to-r from-slate-50 to-white`
   - Close button: Circular with hover circle background

4. Form inputs inside modals:
   ```tsx
   className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow hover:bg-slate-100"
   ```
   - Floating label labels (animate to top on focus)

**Files to update:** `SubmitTaskModal.tsx`, `ReviewTaskModal.tsx`, `CreateTaskModal.tsx`, `TaskDetailModal.tsx`

---

### **Phase 5: Cross-Cutting Improvements**

#### Step 5.1: Unified Loading States
**Target:** Create `frontend/components/ui/LoadingSpinner.tsx`

Components needed:
- Spinner icon (rotating circle with tail)
- Skeleton loaders for cards, tables, lists
- Page-level loading overlay with logo pulsing

Style:
```tsx
<div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="flex flex-col items-center gap-4">
    <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
    <p className="text-slate-600 font-medium animate-pulse">Loading...</p>
  </div>
</div>
```

Use throughout app: All async operations should show loading state.

#### Step 5.2: Toast Notification Enhancement
**Target:** `frontend/components/ui/Toast.tsx`

Current toast likely basic; upgrade to:

1. Slide-in animation from top-right
2. Auto-dismiss after 4 seconds
3. Dismissible with manual close button
4. Progress bar indicating countdown
5. Variants:
   - Success: Green gradient left border
   - Error: Red gradient left border
   - Warning: Yellow gradient left border
   - Info: Blue gradient left border

Example structure:
```tsx
<div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border-l-4 border-teal-500 backdrop-blur-lg animate-slide-in">
  <div className="p-4 flex gap-3">
    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-sm text-slate-600 mt-0.5">{message}</p>
    </div>
    <button onClick={onClose}>✕</button>
  </div>
</div>
```

#### Step 5.3: Empty State Design
**Target:** All list/table views without data

Create `frontend/components/ui/EmptyState.tsx`:

```tsx
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; href: string; icon: React.ElementType };
}
```

Design:
- Large Lucide icon centered (120px width)
- Icon in circular faded background
- Bold title, subdued description text
- Optional call-to-action button below

Used in: Empty task lists, filtered results, no permissions areas.

#### Step 5.4: Footer Refresh
**Target:** `frontend/components/shared/Footer.tsx`

Current footer may be minimal; add:

1. Centered copyright with year dynamically calculated
2. Two-column links layout on desktop
3. Social/media icons (if applicable)
4. Subtle gradient background instead of flat color

```tsx
<footer className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-200/60">
  <div className="px-6 py-4 text-center text-xs text-slate-500">
    <p>&copy; {new Date().getFullYear()} Central Saga Mandala. All rights reserved.</p>
  </div>
</footer>
```

---

### **Phase 6: Typography & Micro-interactions**

#### Step 6.1: Font Weight Hierarchy
Global typography scaling:

- Page titles: `text-3xl font-black tracking-tight`
- Section headers: `text-xl font-extrabold`
- Card titles: `text-lg font-bold`
- Body text: `text-sm font-normal`
- Captions/metadata: `text-xs font-semibold uppercase tracking-wide`

Apply consistently across all pages.

#### Step 6.2: Interactive Feedback
Add universally across clickable elements:

1. Active state compression: `active:scale-95 active:transition-transform`
2. Focus rings: `focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`
3. Transition timing: `transition-all duration-300`

#### Step 6.3: Scrollbar Styling
Existing scrollbar styles in globals.css are good; refine:

```css
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
}
```

Make scrollbars match brand palette subtly.

---

## Critical Files & Anchors

### High-Priority Edit Files
| File | Line Range | Reason |
|------|-----------|--------|
| `frontend/app/globals.css` | Start of file | Add design tokens AFTER `:root` section |
| `frontend/components/shared/Sidebar.tsx` | 82-197 | Complete sidebar rebrand with gradients |
| `frontend/components/shared/Navbar.tsx` | 92-131 | Refine header, add search bar, avatar upgrade |
| `frontend/app/(dashboard)/page.tsx` | 73-117 | Banner header polish and animations |
| `frontend/app/(dashboard)/page.tsx` | 120-189 | Metric card micro-interactions |
| `frontend/app/(dashboard)/page.tsx` | 195-421 | Chart section redesign |
| `frontend/app/(dashboard)/tasks/page.tsx` | ~400+ | Toolbar and display mode overhaul |
| `frontend/components/ui/Modal.tsx` | 46-68 | Backdrop blur and modal polish |
| `frontend/components/ui/Toast.tsx` | Entire file | Upgrade toast animations and variants |

### New Component Files Required
1. `frontend/components/ui/Card.tsx` - Reusable elevated/floating/glass cards
2. `frontend/components/ui/Badge.tsx` - Status/grade label system
3. `frontend/components/ui/Button.tsx` - Unified button variants
4. `frontend/components/ui/LoadingSpinner.tsx` - Loading states
5. `frontend/components/ui/EmptyState.tsx` - No-data states

---

## Verification

### Prerequisites
1. Node.js 18+ installed
2. Project dependencies installed: `cd frontend && npm install`
3. Backend API running (or mock data configured)
4. Test user credentials from README (admin@centralsaga.com / password)

### Step-by-Step QA Process

**Step 1: Foundation Check**
```bash
cd frontend
npm run dev
```
Visit http://localhost:3000
- ✅ Verify CSS custom properties loaded (DevTools → Computed tab → check `--brand-primary`)
- ✅ No console errors in Network tab
- ✅ Fonts render correctly (Geist Sans/Mono)

**Step 2: Layout Flow**
- Navigate to Dashboard page
- ✅ Sidebar gradient renders smoothly, no flickering
- ✅ Brand logo has subtle pulse animation
- ✅ Active nav item shows left accent bar
- ✅ Hover effects on nav items smooth (<300ms)
- ✅ Navbar search bar focuses with `/` hotkey

**Step 3: Component Library**
- Create temporary test page `frontend/app/test-design-system/page.tsx`
- Render all new components: `<Card>`, `<Badge>`, `<Button>`
- ✅ Each component variant displays correctly
- ✅ Interactions work (click, hover, focus)
- ✅ Responsive layout adapts properly

**Step 4: Dashboard Metrics**
- On main dashboard:
  - ✅ Banner gradient transitions smooth
  - ✅ Metric cards have hover lift effect
  - ✅ Icons skew and glow on hover
  - ✅ Clicking metric card triggers toast
  - ✅ Particles breathe/pulse continuously

**Step 5: Tasks Management**
- Navigate to `/tasks`
  - ✅ Toolbar has gradient background
  - ✅ Search bar filters tasks immediately
  - ✅ View toggle switches table/grid smoothly
  - ✅ Table rows hover lift
  - ✅ Modal dialogs open/close with proper animations
  - ✅ Form inputs have focus states

**Step 6: Animations Performance**
- Open Chrome DevTools → Performance tab
- Record while navigating between pages
- ✅ Frame rate stays above 55 FPS
- ✅ No long main thread blocking (>50ms)
- ✅ GPU acceleration enabled (transform/composite layers)

**Step 7: Mobile Responsiveness**
- Resize browser to:
  - iPhone SE (375×667)
  - iPad (768×1024)
  - Desktop (1440×900)
- ✅ Sidebar collapses to icon-only on mobile
- ✅ Grid layouts stack to single column
- ✅ Touch targets minimum 44px height/width
- ✅ Scrollbars usable on touch devices

**Step 8: Accessibility**
- Run Lighthouse audit (Chrome DevTools → Lighthouse)
- Target scores:
  - Performance: ≥90
  - Accessibility: ≥95
  - Best Practices: ≥90
  - SEO: N/A (internal app)
- ✅ All interactive elements keyboard navigable
- ✅ Color contrast ratios meet WCAG AA (4.5:1 for text)
- ✅ Alt text present on images/logos

**Step 9: Integration Testing**
- Login as employee user
- ✅ Permissions-based navigation respected
- ✅ Toast messages appear in correct location
- ✅ Loading spinners show during async ops
- ✅ Empty states display when no data

**Step 10: Production Build**
```bash
cd frontend
npm run build
npm run start
```
- ✅ No TypeScript compilation errors
- ✅ Bundle size under 500KB (uncompressed)
- ✅ Assets optimize (next/image lazy loads)

### Manual Visual Inspection Checklist

Print these screens for comparison against target Dribbble inspirations:

1. **Dashboard Overview** - Compare to "Clean Minimal Dashboard" shot
2. **Tasks List** - Ensure consistent spacing and elevation hierarchy
3. **Sidebar** - Confirm gradient flows from top to bottom evenly
4. **Modals** - Verify backdrop blur intensity (not too strong/dim)
5. **Empty States** - Check icon sizes and typography hierarchy
6. **Loading States** - Ensure spinner rotation is smooth, not jerky

### Regression Testing

Ensure these functions still work post-makeover:

| Feature | Test Case | Expected Result |
|---------|-----------|----------------|
| Task Creation | Click "Create Task" → Fill form → Submit | Task appears in list immediately |
| Task Submission | Open task → Submit proof → Confirm | Status changes to "SUBMITTED" |
| Task Review | Manager opens submitted task → Approve | Status becomes "COMPLETED" |
| Search | Type query in search bar | Real-time filtering |
| Sorting | Select sort order | Tasks reorder accordingly |
| Pagination | Navigate through pages | Correct records per page |
| Auth Flow | Logout → Login again | Session persists |
| Mobile Nav | Hamburger menu tap | Sidebar toggles visible |

---

## Assumptions & Contingencies

### User Decisions Required

1. **Brand Color Dominance Decision**
   - Option A: Emphasize Central Saga green heavily (`teal-600` dominant)
   - Option B: Maintain balance with slate-gray neutral tones
   - Recommendation: **Option B** - Use teal sparingly as accent; let slate provide structure
   
2. **Animation Intensity Preference**
   - Option A: Fast, snappy animations (150-200ms)
   - Option B: Slow, luxurious animations (400-500ms)
   - Recommendation: **Option A** - Enterprise apps benefit from responsiveness over drama

3. **Mobile Navigation Pattern**
   - Option A: Slide-out drawer sidebar (current)
   - Option B: Bottom tab bar for primary sections
   - Option C: Hamburger menu with expandable submenus
   - Recommendation: **Option A** - Maintains consistency with desktop, simpler implementation

### Technical Assumptions

1. **Assumption:** `recharts` library available or can be installed
   - **Contingency:** If installation blocked, implement SVG fallback charts
   - Install command: `npm install recharts`

2. **Assumption:** Lucide React icons version compatible (current: v1.31.0)
   - **Contingency:** Some newer icons may not exist; fall back to closest equivalent

3. **Assumption:** Next.js 16 supports latest Tailwind v4 features
   - **Contingency:** If Tailwind classes rejected, use inline styles as fallback

### Implementation Risks

| Risk | Probability | Mitigation Strategy |
|------|-------------|---------------------|
| Performance degradation from many animations | Medium | Use `will-change` property sparingly; disable animations on reduced-motion systems |
| Modal z-index conflicts | Low | Set explicit high z-index (`z-50`) on modals |
| Broken breakpoints causing layout shift | Low | Test every change at standard widths: 375, 768, 1024, 1440px |
| CSS variable override conflicts | Low | Prefix all custom vars with `simkap-` to avoid Tailwind clashing |

### Fallback Plans

**If design tokens approach fails:**
- Use utility-first Tailwind classes directly
- Maintain consistency through component abstraction instead of CSS vars

**If glassmorphism causes performance issues:**
- Reduce blur strength: `backdrop-blur-xs` instead of `lg`
- Limit glass usage to critical components (modals, navbar)

**If gradient animations lag:**
- Simplify to static gradients
- Use `opacity` transitions instead of `transform`

---

## Implementation Sequence

Complete phases **in order** (each phase depends on previous):

1. ✅ **Phase 1**: Design tokens → foundational CSS
2. ✅ **Phase 2**: Sidebar/Navbar → layout skeleton
3. ✅ **Phase 3**: Dashboard → key visualization
4. ✅ **Phase 4**: Tasks → complex interaction page
5. ✅ **Phase 5**: Cross-cutting → global polish
6. ✅ **Phase 6**: Typography/micro → final refinement

**Estimated Timeline:**
- Phase 1-2: Day 1 (foundation complete)
- Phase 3-4: Day 2-3 (core pages polished)
- Phase 5-6: Day 4 (system-wide refinement)

Total: **~4 working days** for full implementation.
