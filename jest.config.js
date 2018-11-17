module.exports = {
  roots: ["<rootDir>/src", "<rootDir>"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFiles: ["./src/ts/setupTests.ts"],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(otf|ttf)$": "<rootDir>/__mocks__/fontMock.js"
  }
};
