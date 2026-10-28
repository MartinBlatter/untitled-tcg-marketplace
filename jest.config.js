const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Playwright specs live in tests/ and tests-examples/ and must not be run by Jest
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/tests/',
    '<rootDir>/tests-examples/',
  ],
  // No transformIgnorePatterns here: next/jest already supplies both the
  // node_modules and the CSS-module pattern, and the lists are OR'd - a blanket
  // '/node_modules/' entry here would re-ignore jose after the patch below
  // carved it out.
};

/**
 * `jose` (used by src/lib/auth/session.ts) publishes ESM only, so Jest has to
 * transform it. Adding a pattern to `transformIgnorePatterns` does not work:
 * next/jest prepends its own two node_modules patterns, the list is OR'd, and
 * next's `.pnpm` pattern matches jose — so jose stays ignored and importing it
 * throws "Must use import to load ES Module".
 *
 * Those patterns are already allow-lists of packages to transform (`geist`,
 * next's own client code), spelled with Windows separators. So rather than
 * replacing them — and losing whatever next needs them for — add `jose` to each
 * alternation. That keeps working if next changes the rest of the pattern.
 */
function allowJoseToBeTransformed(patterns) {
  let patched = false;

  const result = patterns.map(pattern => {
    if (!pattern.includes('(geist|')) return pattern;
    patched = true;
    return pattern.split('(geist|').join('(geist|jose|');
  });

  if (!patched) {
    throw new Error(
      "jest.config.js expected next/jest's transformIgnorePatterns to contain '(geist|' so that " +
      'jose could be added to it. next/jest has changed; see the comment above this function.'
    );
  }

  return result;
}

// Exported as an async function so the generated config can be adjusted after
// next/jest has built it.
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  return {
    ...config,
    transformIgnorePatterns: allowJoseToBeTransformed(config.transformIgnorePatterns),
  };
};
