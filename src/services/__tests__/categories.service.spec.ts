import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { categoriesService } from '../categories.service';
import { categoriesList } from '../../test/mocks/fixtures';
import { server } from '../../test/mocks/server';

describe('categoriesService', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('getAll', () => {
    it('returns the list of categories', async () => {
      const result = await categoriesService.getAll();

      expect(result).toHaveLength(categoriesList.length);
      expect(result[0].name).toBe(categoriesList[0].name);
    });

    it('throws when the backend returns an unexpected error', async () => {
      server.use(
        http.get('http://localhost:3000/categories', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      await expect(categoriesService.getAll()).rejects.toThrow();
    });
  });
});
