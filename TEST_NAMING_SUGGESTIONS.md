# Test Naming Suggestions - Quick Reference

This document provides a quick reference for suggested test file names and describe block improvements.

## Current vs. Suggested Names

| File Path | Current describe() | Suggested describe() |
|-----------|-------------------|---------------------|
| **Authentication Tests** |
| `server/api/auth/login/index.post.test.ts` | `login` | `POST /api/auth/login - User Authentication` |
| `server/api/auth/logout/index.post.test.ts` | `logout` | `POST /api/auth/logout - Session Termination` |
| `server/api/auth/refresh/index.post.test.ts` | `refresh` | `POST /api/auth/refresh - Token Refresh and Rotation` |
| `server/api/auth/register/index.post.test.ts` | `register` | `POST /api/auth/register - User Registration and Validation` |
| **Category Tests** |
| `server/api/categories/index.get.test.ts` | `get root categories` | `GET /api/categories - List Root Categories with Lot Counts` |
| `server/api/categories/index.post.test.ts` | `create category` | `POST /api/categories - Create Category with Validation and Authorization` |
| `server/api/categories/[id]/index.get.test.ts` | `get category` | `GET /api/categories/:id - Retrieve Category with Children and Lot Counts` |
| `server/api/categories/[id]/index.patch.test.ts` | `update category` | `PATCH /api/categories/:id - Update Category and Cascade Path Changes` |
| `server/api/categories/[id]/index.delete.test.ts` | `delete category` | `DELETE /api/categories/:id - Remove Category with Constraint Validation` |
| **Lot Tests** |
| `server/api/lots/index.post.test.ts` | `create draft lot` | `POST /api/lots - Create Draft Lot` |
| `server/api/lots/[id]/images/index.get.test.ts` | `get images` | `GET /api/lots/:id/images - Retrieve Lot Images with Ordering` |
| `server/api/lots/[id]/images/index.post.test.ts` | ⚠️ `create draft lot` **(WRONG)** | `POST /api/lots/:id/images - Upload Lot Images with Validation` |
| `server/api/lots/[id]/images/index.delete.test.ts` | ⚠️ `create draft lot` **(WRONG)** | `DELETE /api/lots/:id/images - Remove Lot Images` |
| `server/api/lots/[id]/images/update-order/index.post.test.ts` | `update order of lot images` | `POST /api/lots/:id/images/update-order - Reorder Lot Images` |
| **Profile Tests** |
| `server/api/profile/recovery/index.test.ts` | `reset password` | `POST /api/profile/recovery - Password Reset Flow with Token Validation` |
| `server/api/profile/sessions/index.get.test.ts` | `session fetching` | `GET /api/profile/sessions - List User Sessions with Permission Check` |
| `server/api/profile/sessions/index.delete.test.ts` | `session deleting` | `DELETE /api/profile/sessions - Terminate User Sessions` |
| **User Tests** |
| `server/api/users/[id]/index.get.test.ts` | `get /api/users/:id` | `GET /api/users/:id - Retrieve User Profile (Public and Authenticated)` |

## Critical Issues to Fix

### 🔴 Duplicate/Incorrect Test Names

Three test files have **incorrect describe blocks** (copy-paste errors):

1. **File:** `server/api/lots/[id]/images/index.post.test.ts`
   - **Current:** `describe('create draft lot', ...)`
   - **Should be:** `describe('POST /api/lots/:id/images - Upload Lot Images with Validation', ...)`

2. **File:** `server/api/lots/[id]/images/index.delete.test.ts`
   - **Current:** `describe('create draft lot', ...)`
   - **Should be:** `describe('DELETE /api/lots/:id/images - Remove Lot Images', ...)`

3. **Impact:** These incorrect names make test output confusing and harder to debug

## Naming Convention

### Recommended Format

```typescript
describe('HTTP_METHOD /api/path/:params - Brief Description of Functionality', async () => {
  // tests...
})
```

### Benefits
- **Clarity**: Immediately shows what endpoint is being tested
- **Consistency**: Same format across all test files
- **Debugging**: Easier to find failing tests in CI/CD output
- **Documentation**: Test names serve as API documentation

### Examples

**Good:**
```typescript
describe('POST /api/auth/login - User Authentication', ...)
describe('GET /api/categories/:id - Retrieve Category with Children and Lot Counts', ...)
describe('DELETE /api/lots/:id/images - Remove Lot Images', ...)
```

**Bad:**
```typescript
describe('login', ...)  // Too generic
describe('create draft lot', ...)  // Used for image upload (wrong!)
describe('update category', ...)  // Doesn't show cascade behavior
```

## Quick Win: Fix Critical Issues

To quickly improve test clarity, update these three files:

### 1. Fix `server/api/lots/[id]/images/index.post.test.ts`
```diff
- describe('create draft lot', async () => {
+ describe('POST /api/lots/:id/images - Upload Lot Images with Validation', async () => {
```

### 2. Fix `server/api/lots/[id]/images/index.delete.test.ts`
```diff
- describe('create draft lot', async () => {
+ describe('DELETE /api/lots/:id/images - Remove Lot Images', async () => {
```

### 3. Update all other test files (optional but recommended)
Apply the naming convention from the table above to all test files for consistency.

## Additional Recommendations

### Nested Describe Blocks
The current pattern of using nested `describe('error handling', ...)` blocks is good. Consider extending this:

```typescript
describe('POST /api/auth/login - User Authentication', async () => {
  describe('successful login', () => {
    it('should login user', ...)
    it('should return pair of access and refresh tokens', ...)
    it('should return refresh token in cookie', ...)
  })
  
  describe('error handling', () => {
    it('should return error if username not exists', ...)
    it('should return error if password is incorrect', ...)
  })
})
```

### Test Case Naming
Current test case names are mostly good. Consider these patterns:

**Good patterns (already used):**
- `it('should [action] when [condition]', ...)`
- `it('should return error if [condition]', ...)`
- `it.each([...])('should [action] when field is "%s"', ...)`

**Enhance with:**
- More context in error cases: `it('should return 401 when user is not authenticated', ...)`
- Explicit status codes: `it('should return 404 when category not found', ...)`

---

For detailed analysis, coverage statistics, and comprehensive recommendations, see [TEST_ANALYSIS.md](./TEST_ANALYSIS.md).
