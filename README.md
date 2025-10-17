# Twenty → Via MVP Transformation

## What We're Doing

Using Twenty CRM's codebase as the foundation, transforming it to work with Next.js, Tailwind, shadcn, and Convex.

## ✅ Phase 1 Complete: Foundation Setup

1. Cloned Twenty CRM
2. Deleted unnecessary packages
3. Created new Next.js app at `twenty-next/`
4. Implemented Twenty's complete design system in Tailwind

## Dev Server Running

**URL**: http://localhost:3002

```bash
cd /Users/grant/Desktop/twenty-via/twenty-next
npm run dev
```

## Next Steps

1. Port navigation sidebar
2. Port layout
3. Port table components
4. Create companies page
5. Set up Convex backend
6. Integrate your Assistant and Workflows pages

## Documentation

- [TWENTY_VIA_TRANSFORMATION_PLAN.md](TWENTY_VIA_TRANSFORMATION_PLAN.md) - Complete strategy
- [IMPLEMENTATION_STEPS.md](IMPLEMENTATION_STEPS.md) - Step-by-step guide
- [STATUS.md](STATUS.md) - Current progress

## File Structure

```
twenty-via/
├── packages/twenty-front/  📚 Reference (original Twenty)
└── twenty-next/            🚀 New Next.js app (active development)
    ├── app/globals.css     ✅ Twenty design system complete
    └── components/         ⏳ Next (port Twenty components here)
```

**Timeline**: 7-10 days total
**Current**: Design system ✅ | Next: Navigation sidebar
