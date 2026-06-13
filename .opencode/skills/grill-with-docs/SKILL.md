---
name: grill-with-docs
description: Grilling session that challenges your plan against the existing domain model, sharpens terminology, and records hard decisions as ADRs. Use when user wants to stress-test a plan against their project's language and documented decisions.
---

<what-to-do>

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing.

If a question can be answered by exploring the codebase, explore the codebase instead.

</what-to-do>

<supporting-info>

## Path resolution

The `thoughts/` folder lives at the project root. The wiki always lives at `thoughts/wiki/`.

## Wiki structure

```
thoughts/wiki/
├── contexts/
│   ├── CONTEXT-MAP.md              ← exists when multiple domains are in play
│   └── {domain}/
│       ├── CONTEXT.md              ← domain glossary
│       ├── specs/                  ← promoted specs
│       ├── adr/                    ← domain-specific decisions
│       │   ├── 0001-slug.md
│       │   └── 0002-slug.md
│       └── CHANGELOG.md            ← domain changelog
```

Create files lazily — only when you have something to write. If no `CONTEXT.md` exists for the domain, create it when the first term is resolved. If no `adr/` dir exists, create it when the first ADR is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. ADRs go in `<thoughts-dir>/wiki/contexts/{domain}/adr/`. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).

</supporting-info>
