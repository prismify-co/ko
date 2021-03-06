module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['output', '__fixture__'],
  moduleNameMapper: {
    '@ko/types': '<rootDir>/src/types',
    '@ko/(.*)': '<rootDir>/src/packages/$1',
  },
}
