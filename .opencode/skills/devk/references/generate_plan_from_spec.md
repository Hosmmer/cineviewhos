---
description: Generate implementation plans from approved specifications
model: opus
---

# Generate Implementation Plan from Specification

Generate a detailed, phased implementation plan from an approved specification document. This is Step 5 in the Spec Driven Development (SDD) pipeline.

## Prerequisites

Before generating a plan, you must have:
1. An approved specification document at `thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_spec.md`
2. Access to the codebase for validation
3. The JIRA ticket number (extracted from the spec file path)

## Role

You are a senior software architect. Your job is to translate a specification into a concrete, phased implementation plan.

**CRITICAL: DO NOT write any code during plan generation. This is a planning phase only.**

**LANGUAGE: Write the entire plan document in English — all sections, phase descriptions, success criteria, notes, everything. No exceptions.**

## Environment

- Write plans to `thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_plan.md`
- Plan goes in the SAME directory as the spec file
- Filename format: `YYYY-MM-DD-feature-name_plan.md` (note the `_plan.md` suffix)
- `thoughts/` lives at the project root. Always use `thoughts/` as a relative path from the project root.
  - Full example: `thoughts/tickets/TICKET-123/2026-06-13-feature-name_plan.md`
- Use `Skills: (none)` on all phases
- Use whatever commands exist in the project (`pytest`, `ruff check`, `npm run lint`, etc.)

## Getting Started

When this reference is loaded:

1. **Extract ticket number from spec file path** (e.g., `thoughts/tickets/TICKET-123/...` → `TICKET-123`)
2. **Read the specification file completely** from `thoughts/tickets/TICKET-123/*_spec.md`
3. **Try to find and read AGENTS.md or .opencode/opencode.json** (if it exists in project root)
4. **Verify understanding by cross-referencing spec with codebase**
5. **Begin plan generation** — output will go to `thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_plan.md`

## Plan Generation Process

### Step 1: Read and Analyze Inputs

1. **Read the spec file fully** — understand all requirements, acceptance criteria, and constraints
2. **Look for CLAUDE.md** — read it if it exists to understand project conventions
3. **Verify entities and patterns** — use research tools to confirm:
   - Models/entities mentioned in spec actually exist (or where they should be created)
   - Patterns and conventions are current
   - File paths referenced are accurate

### Step 2: Break Down into Phases

Create a phased approach following these principles:

1. **Incremental and testable** — each phase should be independently verifiable
2. **Low-risk first** — start with data model changes before exposing to users
3. **Respect dependencies** — don't expose APIs before backend logic exists
4. **Map to acceptance criteria** — ensure each criterion is addressed in a phase

Common phase ordering:
- Phase 1: Database/data model changes
- Phase 2: Business logic and services
- Phase 3: API endpoints (if applicable)
- Phase 4: Frontend/UI (if applicable)
- Phase 5: Integration and edge cases

### Step 3: Detail Each Phase

For each phase, document:

#### Overview
- What this phase accomplishes
- Which acceptance criteria from the spec it addresses
- Why this phase comes in this order

#### Files to Create
List with format:
```
**File**: `path/to/new/file.py`
**Purpose**: [Why this file is needed]
**Key components**: [Main classes/functions it will contain]
```

#### Files to Modify
List with format:
```
**File**: `path/to/existing/file.py`
**Changes**: [Specific modifications needed]
**Reason**: [Why this change is needed per spec]
```

#### Dependencies to Install
```
**Package**: `package-name==version`
**Purpose**: [Why needed for this phase]
**When**: [Install before/during phase]
```

#### Implementation Order (Numbered Steps)
```
1. [First concrete step]
2. [Second concrete step]
3. ...
```

#### Test Cases (Mapped to Spec Criteria)
Map each test to specific acceptance criteria from the spec:
```
**Test**: `test_feature_validates_input`
**Maps to spec criterion**: [Quote relevant criterion from spec]
**Covers**: [What this test verifies]
```

#### Skills Required

Skip this step. All phases get `Skills: (none)`.

Format:
```
Skills: skill-a, skill-b, skill-c
```
or
```
Skills: (none)
```

#### Success Criteria

Separate into two categories:

**Automated Verification:**
- [ ] Tests pass: `[specific command]`
- [ ] Linting passes: `[specific command]`
- [ ] Type checking passes: `[specific command]`
- [ ] Migration applies cleanly (if applicable)

**Manual Verification:**
- [ ] [Specific acceptance criterion from spec is verified]
- [ ] [Edge case handling confirmed]
- [ ] [No regressions in related features]

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

#### Assumptions

Document anything not explicit in the spec:
- Default values chosen
- Implementation approach selected (when spec allowed multiple options)
- Edge case handling not specified in spec
- Integration patterns followed

### Step 4: Document Cross-Cutting Concerns

#### Testing Strategy
- Unit test approach
- Integration test approach
- Manual testing checklist (derived from spec acceptance criteria)

#### Performance Considerations
- Based on spec requirements and codebase patterns
- Any known bottlenecks or optimization opportunities

#### Migration Notes (if applicable)
- Data migration strategy
- Backwards compatibility approach
- Rollback plan

#### References
- Link to the spec: `thoughts/tickets/TICKET-123/[spec-file]_spec.md`
- Link to CLAUDE.md (if exists)
- Related code patterns: `[file:line]`

## Plan Template Structure

````markdown
# [Feature Name] Implementation Plan

**Based on specification**: `thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_spec.md`

## Overview

[1-2 paragraph summary of implementation approach]

## Specification Alignment

This plan implements the following from the spec:
- [Key requirement 1]
- [Key requirement 2]
- [Key requirement 3]

## Files to Create

1. `path/to/file` — [purpose]
2. `path/to/file` — [purpose]

## Files to Modify

1. `path/to/file` — [specific changes]
2. `path/to/file` — [specific changes]

## Dependencies to Install

```bash
pip install package-name==version  # [reason]
npm install package-name@version   # [reason]
```

## Implementation Approach

[High-level strategy explaining how phases work together]

---

## Phase 1: [Descriptive Name]

### Overview
[What this phase accomplishes and which spec criteria it addresses]

### Files to Create

**File**: `path/to/file.py`
**Purpose**: [Why needed]
**Key components**: [What it contains]

### Files to Modify

**File**: `path/to/file.py`
**Changes**: [Specific modifications]
**Reason**: [Why per spec]

### Dependencies

**Package**: `package-name==version`
**Purpose**: [Why needed]

### Implementation Order

1. [Concrete step 1]
2. [Concrete step 2]
3. [Concrete step 3]

### Test Cases

**Test**: `test_name`
**Maps to spec criterion**: "[Quote from spec acceptance criteria]"
**Covers**: [What it verifies]

### Skills Required

Skills: [comma-separated skill names, or "(none)"]

### Success Criteria

#### Automated Verification:
- [ ] Tests pass: `pytest path/to/tests`
- [ ] Linting passes: `ruff check .`
- [ ] Type checking passes: `mypy .`

#### Manual Verification:
- [ ] [Specific acceptance criterion from spec verified]
- [ ] [Edge case handling confirmed]
- [ ] [No regressions in related features]

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

### Assumptions
- [Assumption 1 not explicit in spec]
- [Assumption 2 about implementation approach]

---

## Phase 2: [Descriptive Name]

[Similar structure...]

---

## Testing Strategy

### Unit Tests
- [Approach based on spec acceptance criteria]
- [Key test cases derived from spec]

### Integration Tests
- [End-to-end scenarios from spec]

### Manual Testing Checklist
1. [Test step mapping to spec criterion 1]
2. [Test step mapping to spec criterion 2]
3. [Edge case from spec]

## Performance Considerations

[Any performance requirements or considerations from spec]

## Migration Notes

[If applicable based on spec data model changes]

## References

- Specification: `thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_spec.md`
- Project conventions: `CLAUDE.md` (if exists)
- Similar implementation: `[file:line]`

## Assumptions Summary

All assumptions made during planning (consolidated from phases):
1. [Assumption 1]
2. [Assumption 2]
3. [Assumption 3]
````

## Presenting the Plan

After generating the plan, present it to the user:

```
I've generated the implementation plan at:
`thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_plan.md`

The plan includes:
- [N] phases with clear success criteria
- Maps all [N] acceptance criteria from the spec
- [N] files to create, [N] files to modify
- [N] dependencies to install
- Complete test strategy mapped to spec requirements

Please review the plan and let me know:
- Do the phases have the right scope and order?
- Are all acceptance criteria from the spec addressed?
- Are the assumptions reasonable?

> **Before implementing:** Make sure the spec and plan are pushed and visible to the team. Run `/gcpush` + `/gpr` so the files are on a branch the team can reference. You don't need to wait for the PR to merge to start coding.
- Any technical details that need adjustment?

We can iterate on the plan until it's ready for implementation.
```

## Iteration

Be ready to:
- Adjust phase boundaries
- Clarify implementation steps
- Add missing test cases
- Resolve assumptions that should be explicit decisions
- Update based on new codebase findings

## Important Guidelines

1. **Traceability**: Every phase should clearly map back to spec acceptance criteria

2. **Completeness**: Address ALL acceptance criteria from the spec — don't leave any out

3. **Testability**: Every success criterion should be verifiable (automated or manual)

4. **Clarity**: Implementation steps should be concrete enough that an agent can execute them

5. **No Open Questions**: Unlike the spec, the plan should have NO open questions. All decisions must be made. If uncertain about an approach:
   - Research the codebase for patterns
   - Make a documented assumption
   - Choose the most conservative/safest option

6. **Respect Spec Boundaries**: Don't add features not in the spec. Don't skip requirements that are in the spec.

## Anti-patterns (what to NEVER do)

- ❌ Writing code during plan generation
- ❌ Skipping acceptance criteria from the spec
- ❌ Adding features not in the spec
- ❌ Leaving implementation steps vague ("update the models")
- ❌ Missing the `Skills:` line entirely on any phase (use `Skills: (none)`)
- ❌ Having open questions in the final plan

## Next Steps

After the plan is approved:
1. Proceed to **Execute Implementation** phase (read `references/implement_plan.md`)
2. The implementation will execute each phase in order
3. Each phase will verify against both the plan's success criteria and the spec's acceptance criteria
