# Dev Skill: Generate Specification

Generate a formal specification document from research findings and user clarifications. This is Step 3 in the Spec Driven Development (SDD) pipeline.

## Prerequisites

Before generating a spec, you must have completed:
1. **Research** — Understanding of current codebase state, patterns, and constraints
2. **Grill-me** — Clarification of requirements, business rules, and user expectations

## Role

You are a senior product analyst. Your job is to translate technical research and user requirements into a clear, actionable specification document.

**CRITICAL: DO NOT write any code during spec generation. This is a documentation phase only.**

**LANGUAGE: Write the entire spec document in English — titles, sections, acceptance criteria, business rules, everything. No exceptions.**

## Specification Template

Generate a Markdown specification covering these sections:

### 1. Feature Summary
- 1-2 paragraph overview of what this feature does and why it exists
- Include the business value or problem being solved
- Reference any research findings that informed this feature

### 2. Data Model / Entities Involved

List all data models/entities that will be:
- Created (new models)
- Modified (existing models with changes)
- Referenced (used but not changed)

For each entity, specify:
- Entity name and file location (if exists)
- Key fields/properties
- Relationships to other entities
- Any database constraints

### 3. Business Rules and Constraints

Document all business logic, validation rules, and constraints:
- Input validation rules
- Business logic conditions
- Authorization/permission rules
- Data integrity constraints
- Any codebase conventions that must be followed (discovered during research)

### 4. Acceptance Criteria (Testable)

Write specific, testable acceptance criteria:
- Use "Given/When/Then" format where appropriate
- Each criterion should be verifiable through testing
- Cover both happy path and edge cases
- Map to specific user interactions or system behaviors

Example format:
```
- [ ] Given [initial state], when [action], then [expected outcome]
- [ ] System validates [X] and rejects [Y]
- [ ] User with [role] can [action], user with [other role] cannot
```

### 5. Out of Scope

Explicitly list what this feature will NOT do:
- Related features that might be confused with this one
- Future enhancements that are deferred
- Edge cases that are acknowledged but not handled
- Any assumptions about what won't change

### 6. Open Questions

List any questions that still need answers before implementation:
- Technical decisions that need human judgment
- Ambiguous requirements that need clarification
- Dependencies on external systems/teams
- Performance requirements not yet specified

**Note**: Aim to minimize open questions. If something can be determined from research or reasonable defaults, make a decision and document it in the appropriate section instead.

## File Location and Naming

**Both**: `thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_spec.md`

- **Directory**: `thoughts/tickets/TICKET-123/` where TICKET-123 is a ticket ID (e.g. `FEAT-001`, `FIX-042`)
- **Filename**: `YYYY-MM-DD-feature-name_spec.md` where:
  - `YYYY-MM-DD` is the current date
  - `feature-name` is a brief kebab-case description
  - `_spec.md` suffix identifies this as a specification file

**Example**: `thoughts/tickets/FEAT-001/2026-06-13-custom-erpnext-module_spec.md`

**Important**: The ticket directory should only contain spec and plan files.

## Generation Process

### Step 0: Resolve thoughts directory + Get ticket ID

The `thoughts/` directory lives at the project root. Verify it exists:

```powershell
# Windows:
Get-ChildItem "thoughts"
# Linux/macOS:
ls thoughts/
```

If `thoughts/` doesn't exist, create it:
```powershell
# Windows:
New-Item -ItemType Directory -Path "thoughts/tickets", "thoughts/wiki/contexts" -Force
# Linux/macOS:
mkdir -p thoughts/tickets thoughts/wiki/contexts
```

Then ask the user for a ticket ID:

> "What ticket ID should I use for this feature? (e.g., `FEAT-001`, `FIX-042`, or a descriptive slug)"

Use whatever the user provides as `TICKET-ID` for all subsequent file paths.

### Step 1: Synthesize Research and Grill Findings

Review everything you learned:
- Current codebase patterns and conventions (from research phase)
- User requirements and clarifications (from grill-me phase)
- Technical constraints and existing implementations
- Similar features or patterns in the codebase

### Step 2: Create Ticket Directory and Draft Specification

1. **Create the ticket directory** if it doesn't exist: `<thoughts-dir>/tickets/TICKET-123/`
2. **Write the spec** following the template above. Be specific and concrete:
- Reference actual file paths and line numbers from research
- Use concrete examples rather than abstract descriptions
- Base acceptance criteria on real user scenarios discussed in grill-me
- Document constraints discovered during research

### Step 3: Present to User

After writing the spec, present it to the user:

```
I've generated the specification document at:
`thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_spec.md`

The spec includes:
- Feature summary based on our discussion
- [N] entities involved: [list key ones]
- [N] business rules and constraints
- [N] testable acceptance criteria
- Clear out-of-scope boundaries

Please review the spec and let me know:
- Are the acceptance criteria complete and testable?
- Are the business rules accurate?
- Is anything out-of-scope that should be in-scope, or vice versa?
- Should any open questions be resolved now?

We can iterate on the spec until it accurately captures the feature requirements.

> **Share with the team:** The spec is local until pushed. Once you're happy with it, run `/gcpush` to push it to a branch, then `/gpr` to open a PR.
```

### Step 4: Iterate Based on Feedback

Be ready to:
- Add missing acceptance criteria
- Clarify ambiguous business rules
- Adjust scope boundaries
- Resolve open questions through additional research or clarification
- Update data model based on technical insights

## Important Guidelines

1. **Be Precise**: Use specific terminology from the codebase (model names, field names, etc.)

2. **Be Complete**: Every acceptance criterion should be testable. Every business rule should be implementable.

3. **Be Realistic**: Base the spec on actual codebase patterns and constraints, not ideal-world assumptions.

4. **Be Clear About Trade-offs**: If research revealed multiple approaches, document which one was chosen and why.

5. **Reference the Code**: When describing entities or patterns, reference actual files where they exist or will be created.

6. **Separate What from How**: The spec describes WHAT the feature does, not HOW it's implemented. Save implementation details for the plan phase.

## Anti-patterns (what to NEVER do)

- ❌ Writing code or implementation details in the spec
- ❌ Being vague about acceptance criteria ("system should work well")
- ❌ Ignoring constraints discovered during research
- ❌ Creating specs without completing research and grill-me first
- ❌ Leaving critical decisions as open questions that could be resolved now
- ❌ Copying generic templates without customizing to actual codebase context

## Output Format

The spec file should be pure Markdown with clear section headers. Use:
- Checkboxes `[ ]` for acceptance criteria
- Code blocks for data model examples
- File references with `file:line` notation when relevant
- Tables for complex business rules if needed

## Next Steps

After the spec is approved:
1. Proceed to **Generate Plan** phase (read `references/generate_plan_from_spec.md`)
2. The plan will be created in the same ticket directory: `thoughts/tickets/TICKET-123/YYYY-MM-DD-feature-name_plan.md`
3. The plan will use this spec as the authoritative requirements document
4. Implementation will verify against the acceptance criteria in this spec
