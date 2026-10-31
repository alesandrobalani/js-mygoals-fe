import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsync } from '../useAsync';

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe('useAsync', () => {
  it('starts loading and exposes data when the promise resolves', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve(42), ['a']));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeUndefined();
  });

  it('exposes the error and keeps loading false when the promise rejects', async () => {
    const failure = new Error('boom');
    const { result } = renderHook(() => useAsync(() => Promise.reject(failure), ['a']));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(failure);
    expect(result.current.data).toBeUndefined();
  });

  it('reloads when a reloadOn value changes, keeping previous data while loading', async () => {
    const fn = vi.fn((n: number) => Promise.resolve(n * 10));
    const { result, rerender } = renderHook(({ n }) => useAsync(() => fn(n), [n]), {
      initialProps: { n: 1 },
    });
    await waitFor(() => expect(result.current.data).toBe(10));

    rerender({ n: 2 });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(10);

    await waitFor(() => expect(result.current.data).toBe(20));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not reload when the component re-renders with the same reloadOn values', async () => {
    const fn = vi.fn(() => Promise.resolve('ok'));
    const { result, rerender } = renderHook(() => useAsync(fn, ['same']));
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender();
    expect(result.current.loading).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('keeps the last successful data after a failed reload and clears the error on next success', async () => {
    let shouldFail = false;
    const { result, rerender } = renderHook(({ k }) => useAsync(
      () => (shouldFail ? Promise.reject(new Error('x')) : Promise.resolve(`v${k}`)),
      [k],
    ), { initialProps: { k: 1 } });
    await waitFor(() => expect(result.current.data).toBe('v1'));

    shouldFail = true;
    rerender({ k: 2 });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.data).toBe('v1');

    shouldFail = false;
    rerender({ k: 3 });
    await waitFor(() => expect(result.current.data).toBe('v3'));
    expect(result.current.error).toBeUndefined();
  });

  it('ignores responses from stale requests', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const calls = [first, second];
    const { result, rerender } = renderHook(({ k }) => useAsync(() => calls[k].promise, [k]), {
      initialProps: { k: 0 },
    });

    rerender({ k: 1 });
    second.resolve('second');
    await waitFor(() => expect(result.current.data).toBe('second'));

    first.resolve('first');
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.data).toBe('second');
    expect(result.current.loading).toBe(false);
  });
});
