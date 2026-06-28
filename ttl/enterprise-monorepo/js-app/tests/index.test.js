const { add, multiply, factorial } = require('../src/index');

describe('add', () => {
  test('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('handles negatives', () => {
    expect(add(-1, 1)).toBe(0);
  });
});

describe('multiply', () => {
  test('multiplies two numbers', () => {
    expect(multiply(3, 4)).toBe(12);
  });

  test('multiply by zero', () => {
    expect(multiply(5, 0)).toBe(0);
  });
});

describe('factorial', () => {
  test('factorial of 5', () => {
    expect(factorial(5)).toBe(120);
  });

  test('factorial of 0 is 1', () => {
    expect(factorial(0)).toBe(1);
  });

  test('negative throws', () => {
    expect(() => factorial(-1)).toThrow('negative input');
  });
});
