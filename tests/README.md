# Unit Tests for Cloudinary Image Operations

This directory contains comprehensive unit tests for the Cloudinary image upload, deletion, and migration functionality in the listing-backend application.

## Test Coverage

The test suite covers the following scenarios:

### 1. Establishment Image Upload
- ✅ Successfully upload establishment images to Cloudinary
- ✅ Handle empty file uploads for establishments
- ✅ Handle mixed uploads (files + existing URLs) for establishments

### 2. Site Image Upload
- ✅ Successfully upload site images to Cloudinary
- ✅ Handle empty file uploads for sites
- ✅ Append new images to existing site images

### 3. Image Deletion from Cloudinary
- ✅ Successfully delete establishment images from Cloudinary
- ✅ Successfully delete site images from Cloudinary
- ✅ Handle deletion errors gracefully
- ✅ Remove deleted images from establishment array
- ✅ Handle multiple image deletions

### 4. Image Migration Script - Establishments
- ✅ Migrate local establishment images to Cloudinary
- ✅ Skip already migrated establishment images
- ✅ Handle missing local establishment files gracefully
- ✅ Handle Cloudinary upload errors during establishment migration

### 5. Image Migration Script - Sites
- ✅ Migrate local site images to Cloudinary
- ✅ Skip already migrated site images
- ✅ Handle missing local site files gracefully
- ✅ Handle Cloudinary upload errors during site migration
- ✅ Migrate multiple sites in batch

## Prerequisites

Before running the tests, ensure you have the following installed:

```bash
npm install
```

This will install all dependencies including Jest, which is configured in the `devDependencies`.

## Running the Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npx jest tests/cloudinary.test.js
```

### Run specific test suite
```bash
npx jest -t "Establishment Image Upload"
```

### Run specific test case
```bash
npx jest -t "should successfully upload establishment images to Cloudinary"
```

## Test Structure

The tests use Jest's mocking capabilities to mock external dependencies:

- **Cloudinary**: Mocked to avoid actual API calls during testing
- **Prisma**: Mocked to simulate database operations without database connection
- **File System (fs)**: Mocked to simulate file existence checks

This approach ensures:
- Tests run quickly without external dependencies
- Tests are isolated and repeatable
- No actual resources are created or consumed
- No Cloudinary account credentials required for testing

## Understanding Test Results

When you run the tests, you'll see output like:

```
PASS  tests/cloudinary.test.js
  Cloudinary Image Operations
    Establishment Image Upload
      ✓ should successfully upload establishment images to Cloudinary (5ms)
      ✓ should handle empty file upload for establishments (3ms)
      ✓ should handle mixed upload (files + URLs) for establishments (2ms)
    Site Image Upload
      ✓ should successfully upload site images to Cloudinary (4ms)
      ✓ should handle empty file upload for sites (2ms)
      ✓ should append new images to existing site images (3ms)
    Image Deletion from Cloudinary
      ✓ should successfully delete establishment image from Cloudinary (3ms)
      ✓ should successfully delete site image from Cloudinary (2ms)
      ✓ should handle deletion error gracefully (3ms)
      ✓ should remove deleted images from establishment array (4ms)
      ✓ should handle multiple image deletions (3ms)
    Image Migration Script - Establishments
      ✓ should migrate local establishment images to Cloudinary (6ms)
      ✓ should skip already migrated establishment images (2ms)
      ✓ should handle missing local establishment files gracefully (3ms)
      ✓ should handle cloudinary upload errors during establishment migration (4ms)
    Image Migration Script - Sites
      ✓ should migrate local site images to Cloudinary (5ms)
      ✓ should skip already migrated site images (2ms)
      ✓ should handle missing local site files gracefully (3ms)
      ✓ should handle cloudinary upload errors during site migration (4ms)
      ✓ should migrate multiple sites in batch (5ms)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        2.345s
```

## Coverage Report

The coverage report shows which parts of your code are tested:

```bash
npm run test:coverage
```

This generates a detailed HTML report in the `coverage/` directory. Open `coverage/index.html` in your browser to see:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## Continuous Integration

These tests can be integrated into your CI/CD pipeline:

```yaml
# Example for GitHub Actions
- name: Run tests
  run: npm test
  
- name: Generate coverage
  run: npm run test:coverage
```

## Writing New Tests

When adding new Cloudinary-related features, follow this pattern:

```javascript
describe('New Feature', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mocks
    });

    test('should handle specific scenario', async () => {
        // Arrange
        const mockData = {...};
        prisma.entity.method.mockResolvedValue(mockData);
        
        // Act
        const result = await functionToTest();
        
        // Assert
        expect(result).toBe(expectedValue);
        expect(mockFunction).toHaveBeenCalledTimes(1);
    });
});
```

## Troubleshooting

### Tests fail with "Cannot find module"
Ensure all dependencies are installed:
```bash
npm install
```

### Tests timeout
Increase the timeout in your test:
```javascript
test('slow test', async () => {
    // test code
}, 10000); // 10 second timeout
```

### Mock issues
Clear all mocks between tests:
```javascript
beforeEach(() => {
    jest.clearAllMocks();
});
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing/unit-testing)
