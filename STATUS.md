# Twenty → Via Transformation Status

## ✅ Completed

### Phase 1: Setup
- [x] Cloned Twenty repo to `/Users/grant/Desktop/twenty-via/`
- [x] Deleted unnecessary packages (server, docker, emails, website, zapier, apps, cli)
- [x] Created new Next.js app at `/Users/grant/Desktop/twenty-via/twenty-next`
- [x] Set up Twenty's complete design system in Tailwind CSS (globals.css)
- [x] Preserved your Assistant and Workflows pages

### Design System
- [x] All Twenty colors defined (gray scale 0-100, accent colors)
- [x] All Twenty spacing (4px based system)
- [x] All Twenty component heights (table row: 32px, header: 56px)
- [x] All Twenty border radius values
- [x] All Twenty animation durations
- [x] Dark mode support
- [x] Twenty scrollbar styles
- [x] Inter font family

## 🚧 Next Steps

### Step 2: Start Dev Server & Test
```bash
cd /Users/grant/Desktop/twenty-via/twenty-next
npm run dev
```

Visit http://localhost:3000 to see Next.js app with Twenty design tokens.

### Step 3: Port Navigation Sidebar
Copy from Twenty and convert to Tailwind:
- `packages/twenty-front/src/modules/navigation/components/AppNavigationDrawer.tsx`
- Convert to: `twenty-next/components/navigation/app-navigation-drawer.tsx`

### Step 4: Port Layout
- Convert `DefaultLayout` to Next.js layout
- Create `app/(app)/layout.tsx`

### Step 5: Port RecordTable
- Copy table components from Twenty
- Convert to Tailwind
- Create `components/record-table/`

### Step 6: Create Companies Page
- `app/(app)/objects/companies/page.tsx`
- List view with RecordTable

### Step 7: Create Company Detail Page
- `app/(app)/objects/companies/[id]/page.tsx`
- Detail view with tabs

### Step 8: Set Up Convex
- Install Convex
- Create schema
- Create queries/mutations

### Step 9: Port People/Contacts
- Same as companies

### Step 10: Integrate shadcn
- Install shadcn components
- Style with Twenty colors

### Step 11: Integrate Your Pages
- Copy Assistant page
- Copy Workflows page

## File Locations

**Twenty-Via Foundation:**
```
/Users/grant/Desktop/twenty-via/
├── packages/
│   ├── twenty-front/     → Reference (original Twenty frontend)
│   ├── twenty-ui/         → Reference (Twenty UI components)
│   └── twenty-shared/     → Reference (types, utilities)
└── twenty-next/           → NEW Next.js app (active development)
    ├── app/
    │   ├── globals.css    ✅ Twenty design system
    │   ├── layout.tsx     ⏳ Next
    │   └── page.tsx       ⏳ Next
    ├── components/        ⏳ Next (will port Twenty components here)
    └── convex/            ⏳ Next (backend)
```

**Your Original (Preserved):**
```
/Users/grant/Desktop/Via-MVP/
└── preserved-pages/
    ├── assistant/
    ├── workflows/
    ├── components-assistant/
    └── components-proposal/
```

## How to Continue

1. **Start dev server**:
   ```bash
   cd /Users/grant/Desktop/twenty-via/twenty-next
   npm run dev
   ```

2. **Port components one by one** from `packages/twenty-front` to `twenty-next/components`

3. **Convert Emotion → Tailwind** for each component

4. **Test** at http://localhost:3000

## Timeline Estimate

- Setup & Design System: ✅ Done (Today)
- Navigation & Layout: 1 day
- Table Components: 1 day
- Companies Pages: 1 day
- Convex Backend: 1 day
- People Pages: 1 day
- shadcn Integration: 1 day
- Preserved Pages: 1 day
- **Total**: ~7-10 days

## Current Focus

✅ Design system complete - all Twenty colors, spacing, and measurements ready
⏳ Next: Start dev server and port first component (Navigation Sidebar)
