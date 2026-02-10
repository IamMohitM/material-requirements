# Test Plan: Phase 1a - Enhanced RequestForm with Unit Support

**Date Created:** 2026-02-10
**Version:** 1.0
**Scope:** Unit Support in Material Requests
**Status:** Ready for Test Execution

---

## Acceptance Criteria Validation Matrix

| # | Criterion | Test Scenario | Type | Status |
|---|-----------|---------------|------|--------|
| 1 | Select from existing materials | Material dropdown in form | Happy Path | ⏳ |
| 2 | Create materials on-the-fly | Modal with unit/category | Happy Path | ⏳ |
| 3 | 9 unit options available | Unit dropdown shows all | Happy Path | ⏳ |
| 4 | Material code auto-generates | Backend MAT-xxxxx | Integration | ⏳ |
| 5 | Unit stored in Material interface | Redux type definition | Code | ⏳ |
| 6 | Display shows quantities with units | "✓ 100 bags" format | Happy Path | ⏳ |
| 7 | Form validation for unit | Cannot submit without unit | Error Handling | ⏳ |
| 8 | Unit in API request payload | Network inspection | Integration | ⏳ |
| 9 | Backend validates unit field | RequestService validation | Code | ⏳ |
| 10 | Frontend builds 0 errors | npm run build | Build | ⏳ |
| 11 | Backend builds 0 errors | npm run build (tsc) | Build | ⏳ |
| 12 | No console errors | Browser console check | Build | ⏳ |
| 13 | Unit persists to database | JSONB storage (Docker) | Integration | ⏳ |

---

## Test Scenarios (10 Total)

### Scenario 1: Create Request with Single Material + Unit
**Type:** Happy Path | **Acceptance Criteria:** #1, #6
- Given: RequestForm is open
- When: User selects existing material, quantity=100, unit="bags"
- Then: Display shows "✓ 100 bags"
- And: Request can be submitted
- Expected Result: Material stored with unit="bags"

### Scenario 2: Create Request with Multiple Different Units
**Type:** Happy Path | **Acceptance Criteria:** #6
- Given: RequestForm is open
- When: User adds 3 materials with different units:
  - Material 1: quantity=50, unit="meters"
  - Material 2: quantity=200, unit="pieces"
  - Material 3: quantity=500, unit="kilograms"
- Then: All 3 display correctly with units
- Expected Result: Request stores all 3 with correct units

### Scenario 3: Submit Without Selecting Unit (Validation)
**Type:** Error Handling | **Acceptance Criteria:** #7
- Given: Material and quantity selected, NO unit
- When: User clicks submit
- Then: Form blocks submission
- And: Error message shows: "Unit is required"
- Expected Result: Validation prevents invalid request

### Scenario 4: Create Material On-the-Fly with Unit
**Type:** Happy Path | **Acceptance Criteria:** #2
- Given: Create Material modal is open
- When: User fills form:
  - name="Steel Reinforcement"
  - unit="meters" (from dropdown)
  - category="steel" (from dropdown)
- Then: Modal shows unit and category as select dropdowns
- When: User clicks "Create Material"
- Then: Modal closes
- And: New material appears in material list
- Expected Result: Material created with correct unit

### Scenario 5: Unit Dropdown Has All 9 Options
**Type:** Happy Path | **Acceptance Criteria:** #3
- Given: UnitSelector dropdown is open
- When: User views all options
- Then: All 9 units present:
  - Meters (m)
  - Bags
  - Pieces
  - Kilograms (kg)
  - Grams (g)
  - Cubic Meters (m³)
  - Liters (L)
  - Sheets
  - Bundles
- Expected Result: Complete unit selection available

### Scenario 6: Unit Value Stored in Redux State
**Type:** Integration | **Acceptance Criteria:** #5
- Given: Redux DevTools open
- When: User selects material with unit="bags"
- Then: Redux state shows:
  ```
  materials: [{ material_id: "uuid", quantity: 100, unit: "bags" }]
  ```
- Expected Result: Unit correctly stored in Redux

### Scenario 7: API Payload Includes Unit Field
**Type:** Integration | **Acceptance Criteria:** #8
- Given: Browser network tab open
- When: User submits request with material
- Then: Request payload includes:
  ```json
  {
    "materials": [
      { "material_id": "uuid", "quantity": 100, "unit": "bags" }
    ]
  }
  ```
- Expected Result: Unit field in API request

### Scenario 8: Frontend Build Verification
**Type:** Build | **Acceptance Criteria:** #10, #12
- Given: Terminal in frontend directory
- When: Run `npm run build`
- Then: Output shows "Compiled successfully"
- And: No errors or warnings
- Expected Result: Build succeeds

### Scenario 9: Backend Build Verification
**Type:** Build | **Acceptance Criteria:** #11
- Given: Terminal in backend directory
- When: Run `npm run build` (tsc)
- Then: TypeScript compilation completes
- And: No errors printed
- Expected Result: Backend builds successfully

### Scenario 10: Form Validation Error States
**Type:** Error Handling | **Acceptance Criteria:** #7
- Given: Material and quantity selected, NO unit
- When: Form renders
- Then: UnitSelector shows invalid state (red border)
- And: Error message displays: "Unit is required"
- When: User selects a unit
- Then: Error disappears, UnitSelector returns normal
- Expected Result: Validation feedback works

---

## Edge Cases (8 Total)

| # | Edge Case | Test | Expected |
|---|-----------|------|----------|
| 1 | Very large quantity (999999) with unit | Enter quantity, select "bags" | Display: "✓ 999999 bags" |
| 2 | Multiple materials with same unit | All 3 materials unit="meters" | All stored as meters |
| 3 | Change unit after selection | Select "meters", then change to "bags" | Display updates to new unit |
| 4 | All 9 units in single request | Create 9 materials, each different unit | All units stored correctly |
| 5 | Rapid unit selection changes | Click different units quickly | Final selection stored |
| 6 | Empty material list then create | Create first material on-the-fly | Material available immediately |
| 7 | Form with only 1 material | Just 1 material + unit | Request valid with single material |
| 8 | Material search then unit select | Search for material, then select unit | Search and unit work together |

---

## Code Inspection Tests (3 Total)

| Test | File | Check | Expected |
|------|------|-------|----------|
| Material Type Definition | requestsSlice.ts | Material interface | Has `unit: string` field |
| Request Entity Type | Request.ts | materials column | Type includes unit field |
| Joi Validation Schema | validators.ts | createRequestSchema | Unit field is required |

---

## Test Execution Sequence

1. Build verification (Frontend + Backend)
2. Code inspection (3 tests)
3. Happy path scenarios (6 scenarios)
4. Error handling scenarios (3 scenarios)
5. Edge cases (8 tests)
6. Integration tests (network payload, Redux state)

**Total Test Cases: 20+**
**Target Pass Rate: 100%**
**Critical Issues Allowed: 0**
**Major Issues Allowed: 0**
