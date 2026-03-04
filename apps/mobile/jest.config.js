module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|expo-modules-core|firebase|@firebase)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};