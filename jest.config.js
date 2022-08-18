const config = {
  verbose: true,
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
  fakeTimers: { enableGlobally: true },
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  moduleDirectories: ['node_modules', 'src'],
};

export default config;
