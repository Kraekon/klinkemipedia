import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce Hook', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  test('debounces value changes with default delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated' });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Value should now be updated
    expect(result.current).toBe('updated');
  });

  test('debounces with custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Value should not change after 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Value should change after 500ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });

  test('cancels previous timeout on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // First change
    rerender({ value: 'first' });

    // Fast-forward 200ms (not enough)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Second change before first timeout completes
    rerender({ value: 'second' });

    // Fast-forward 200ms more (total 400ms from first change)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should have 'second' not 'first'
    expect(result.current).toBe('initial');

    // Fast-forward 100ms more to complete second timeout
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('second');
  });

  test('handles multiple rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // Rapid changes
    rerender({ value: 'change1' });
    rerender({ value: 'change2' });
    rerender({ value: 'change3' });

    // Advance time slightly
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should still be initial
    expect(result.current).toBe('initial');

    // Advance to complete the debounce
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should have the last value
    expect(result.current).toBe('change3');
  });

  test('works with different data types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 42 } }
    );

    expect(result.current).toBe(42);

    rerender({ value: 100 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  test('works with objects', () => {
    const initialObj = { name: 'test', value: 1 };
    const updatedObj = { name: 'updated', value: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initialObj } }
    );

    expect(result.current).toEqual(initialObj);

    rerender({ value: updatedObj });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toEqual(updatedObj);
  });
});
