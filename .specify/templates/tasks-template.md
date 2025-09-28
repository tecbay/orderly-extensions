# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Extension Validation and Configuration
**Focus: Shopify extension configuration and validation**
- [ ] T004 [P] Validate extension configuration in shopify.extension.toml
- [ ] T005 [P] Configure extension targets and capabilities
- [ ] T006 [P] Set up Shopify UI component validation
- [ ] T007 [P] Configure extension settings and merchant options

## Phase 3.3: Extension Implementation
- [ ] T008 [P] React extension component in src/[ExtensionName].jsx
- [ ] T009 [P] Shopify UI components integration
- [ ] T010 [P] Extension API hooks and session token handling
- [ ] T011 Extension state management and React hooks
- [ ] T012 Network request handling with proper error boundaries
- [ ] T013 Extension settings and merchant configuration
- [ ] T014 Error handling and user feedback components

## Phase 3.4: Extension Integration and Testing
- [ ] T015 Test extension in Shopify development store
- [ ] T016 Validate extension targets and placement
- [ ] T017 Test extension with different merchant configurations
- [ ] T018 Verify extension performance and bundle size

## Phase 3.5: Extension Polish and Deployment
- [ ] T019 [P] Add accessibility testing and ARIA labels
- [ ] T020 Optimize extension bundle size and loading performance
- [ ] T021 [P] Update extension documentation and merchant guides
- [ ] T022 Review and refactor extension code for maintainability
- [ ] T023 Prepare extension for production deployment

## Dependencies
- Extension configuration (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T017
- Implementation before polish (T019-T023)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Validate extension configuration in shopify.extension.toml"
Task: "Configure extension targets and capabilities"
Task: "Set up Shopify UI component validation"
Task: "Configure extension settings and merchant options"
```

## Notes
- [P] tasks = different files, no dependencies
- Validate extension configuration before implementing functionality
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Extension Configuration**:
   - Each extension target → configuration task [P]
   - Each capability → setup task

2. **From UI Requirements**:
   - Each component → React component task [P]
   - UI interactions → hook implementation tasks

3. **From User Stories**:
   - Each story → extension functionality [P]
   - Merchant scenarios → configuration validation tasks

4. **Ordering**:
   - Setup → Configuration → Components → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All extension targets have configuration tasks
- [ ] All UI components have implementation tasks
- [ ] All extension configuration comes before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task