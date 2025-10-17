# Twenty → Via Implementation Steps

## Current Setup

✅ **Cleaned up Twenty repo**:
- `/Users/grant/Desktop/twenty-via/packages/twenty-front` - Original Twenty frontend (Vite + React Router + Emotion)
- `/Users/grant/Desktop/twenty-via/twenty-next` - New Next.js app (will become the new frontend)

## Strategy

**Use Twenty as a reference library**, copying components one-by-one into `twenty-next` and converting them to Tailwind.

## Step 1: Copy Twenty's Design Tokens

Create Tailwind config with Twenty's exact values:

```bash
# File: twenty-next/tailwind.config.ts
```

Twenty's colors from `packages/twenty-ui/src/theme/constants/GrayScale.ts`:
- gray0: #ffffff
- gray10: #fcfcfc
- gray15: #f1f1f1
- gray20: #ebebeb
- gray25: #d6d6d6
- gray30: #cccccc
- gray40: #999999
- gray50: #666666
- gray60: #333333
- gray85: #141414

## Step 2: Port Navigation/Sidebar First

**Copy from Twenty:**
- `packages/twenty-front/src/modules/navigation/components/AppNavigationDrawer.tsx`

**Convert to:**
- `twenty-next/components/navigation/app-navigation-drawer.tsx` (Tailwind version)

**Key features:**
- 240px width
- Collapsible
- Dark mode support
- Objects list (Companies, People)
- Settings link
- User menu

## Step 3: Port Layout

**Copy from Twenty:**
- `packages/twenty-front/src/modules/ui/layout/page/components/DefaultLayout.tsx`

**Convert to:**
- `twenty-next/app/(app)/layout.tsx` (Tailwind version)

**Structure:**
```tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white dark:bg-[#141414]">
      <AppNavigationDrawer />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

## Step 4: Port RecordTable (Companies List)

**Copy from Twenty:**
- `packages/twenty-front/src/modules/object-record/record-table/components/RecordTable.tsx`
- `packages/twenty-front/src/modules/object-record/record-table/record-table-row/components/RecordTableRow.tsx`
- `packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCell.tsx`

**Convert to:**
- `twenty-next/components/record-table/record-table.tsx` (Tailwind version)

**Key measurements:**
- Row height: 32px
- Cell padding: 8px horizontal
- Border: 1px solid #ebebeb
- Hover: background #fcfcfc

## Step 5: Create Companies List Page

**Reference Twenty:**
- `packages/twenty-front/src/pages/object-record/RecordIndexPage.tsx`

**Create:**
- `twenty-next/app/(app)/objects/companies/page.tsx`

**Features:**
- Page header with title "Companies"
- Action buttons (Sort, Filter, New)
- RecordTable with company data
- Click to open detail view

## Step 6: Create Company Detail Page

**Reference Twenty:**
- `packages/twenty-front/src/pages/object-record/RecordShowPage.tsx`

**Create:**
- `twenty-next/app/(app)/objects/companies/[id]/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Header (company name)                   │
├─────────┬───────────────────────────────┤
│ Left    │  Main Content                 │
│ Sidebar │  - Summary card               │
│ (348px) │  - Tabs (Overview, Activity)  │
│         │  - Tab content                │
│ Fields: │                               │
│ - Name  │                               │
│ - Email │                               │
│ - Phone │                               │
└─────────┴───────────────────────────────┘
```

## Step 7: Install Convex

```bash
cd /Users/grant/Desktop/twenty-via/twenty-next
npm install convex
npx convex dev
```

Create schema:
```typescript
// convex/schema.ts
export default defineSchema({
  companies: defineTable({
    name: v.string(),
    domainName: v.optional(v.string()),
    // ... more fields
  }),
});
```

## Step 8: Create API Layer

```typescript
// convex/companies.ts
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});
```

Hook into components:
```tsx
// app/(app)/objects/companies/page.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CompaniesPage() {
  const companies = useQuery(api.companies.list);
  return <RecordTable data={companies} />;
}
```

## Step 9: Port People/Contacts

Same process as Companies:
1. Create `app/(app)/objects/people/page.tsx`
2. Create `app/(app)/objects/people/[id]/page.tsx`
3. Add people schema to Convex
4. Create people queries

## Step 10: Install shadcn Components

```bash
npx shadcn@latest init
npx shadcn@latest add button input select dropdown-menu dialog tabs sheet
```

Replace Twenty's UI components with shadcn equivalents (styled with Twenty colors).

## Step 11: Integrate Preserved Pages

```bash
# Copy Assistant page
cp -r /Users/grant/Desktop/Via-MVP/preserved-pages/assistant \
  /Users/grant/Desktop/twenty-via/twenty-next/app/(app)/

# Copy Workflows page
cp -r /Users/grant/Desktop/Via-MVP/preserved-pages/workflows \
  /Users/grant/Desktop/twenty-via/twenty-next/app/(app)/

# Copy components
cp -r /Users/grant/Desktop/Via-MVP/preserved-pages/components-assistant \
  /Users/grant/Desktop/twenty-via/twenty-next/components/assistant
```

Add to navigation sidebar.

## Step 12: Settings Pages

Port essential settings:
- Profile settings
- Workspace settings
- Appearance settings

## Conversion Pattern

For every Twenty component:

1. **Find in Twenty:**
   ```
   packages/twenty-front/src/modules/.../ComponentName.tsx
   ```

2. **Copy to Next.js:**
   ```
   twenty-next/components/.../component-name.tsx
   ```

3. **Convert Emotion → Tailwind:**
   ```tsx
   // BEFORE
   const StyledDiv = styled.div`
     padding: ${({ theme }) => theme.spacing(2)};
   `;

   // AFTER
   <div className="p-2">
   ```

4. **Update imports:**
   - Remove Emotion imports
   - Add Tailwind classes
   - Keep component logic

## Priority Order

1. ✅ Navigation/Sidebar
2. ✅ Layout
3. ✅ RecordTable
4. ✅ Companies list page
5. ✅ Company detail page
6. ✅ People list page
7. ✅ Person detail page
8. ✅ Settings pages
9. ✅ Preserved pages (Assistant, Workflows)

## Testing

At each step:
```bash
cd /Users/grant/Desktop/twenty-via/twenty-next
npm run dev
```

Visit http://localhost:3000 to see progress.

## File Structure (Final)

```
twenty-next/
├── app/
│   ├── (app)/
│   │   ├── layout.tsx (Twenty DefaultLayout)
│   │   ├── objects/
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── people/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── assistant/
│   │   ├── workflows/
│   │   └── settings/
│   └── layout.tsx (root)
├── components/
│   ├── navigation/
│   ├── record-table/
│   ├── record-show/
│   ├── fields/
│   ├── ui/ (shadcn)
│   ├── assistant/
│   └── workflows/
├── convex/
│   ├── schema.ts
│   ├── companies.ts
│   └── people.ts
└── lib/
    └── utils.ts
```

## Next Action

Start with Step 1: Copy Twenty's design tokens to Tailwind config.
