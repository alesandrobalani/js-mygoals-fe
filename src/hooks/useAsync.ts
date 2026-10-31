import { useEffect, useEffectEvent, useState } from 'react';

interface Settled<T> {
  /** Chave da requisição que originou este resultado. */
  key: string;
  /** Último valor carregado com sucesso (mantido durante recargas e após erros). */
  data: T | undefined;
  error: unknown;
}

/**
 * Carrega dados assíncronos e recarrega sempre que algum valor de `reloadOn` muda
 * (ex.: `[startDate, endDate, refreshKey]`). Os valores precisam ser serializáveis.
 *
 * - `loading` é derivado (a requisição atual ainda não respondeu), sem `setState`
 *   síncrono dentro do efeito.
 * - `data` mantém o último sucesso durante recargas e após erros.
 * - `error` refere-se apenas à requisição atual.
 * - Respostas de requisições antigas são descartadas.
 */
export function useAsync<T>(fn: () => Promise<T>, reloadOn: readonly unknown[]) {
  const key = JSON.stringify(reloadOn);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const load = useEffectEvent(fn);

  useEffect(() => {
    let active = true;
    load().then(
      (data) => {
        if (active) setSettled({ key, data, error: undefined });
      },
      (error: unknown) => {
        if (active) setSettled((prev) => ({ key, data: prev?.data, error }));
      },
    );
    return () => {
      active = false;
    };
  }, [key]);

  const isCurrent = settled?.key === key;
  return {
    data: settled?.data,
    loading: !isCurrent,
    error: isCurrent ? settled.error : undefined,
  };
}
