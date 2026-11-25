/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      // 用独立的 tsconfig：主 tsconfig 是给 Next.js 用的（jsx: preserve / module: esnext），
      // ts-jest 需要 jsx: react-jsx + commonjs 才能编译 JSX 与 ESM import。
      tsconfig: '<rootDir>/tsconfig.jest.json',
    },
  },
};

export default config;
