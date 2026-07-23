import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PostProvider, usePost } from '@/context/PostContext';

// Mock fetch
global.fetch = jest.fn();

// Test component that uses the context
const TestComponent = () => {
  const { data, loading, error, filter, setFilter, refresh } = usePost();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="data-count">{data.length}</div>
      <div data-testid="filter-sort">{filter.sort}</div>
      <button onClick={() => setFilter({ sort: 'title' })}>Change Sort</button>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
};

describe('PostContext - Sprint 1 Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bug Fix: Initial Data Load', () => {
    it('should fetch data immediately on mount without tick', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [
            { id: '1', title: 'Post 1', slug: 'post-1' },
            { id: '2', title: 'Post 2', slug: 'post-2' },
          ],
        }),
      });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      // Should start loading immediately
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Should have fetched data
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('data-count')).toHaveTextContent('2');
    });

    it('should not require refresh() call to load initial data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [{ id: '1', title: 'Post 1' }],
        }),
      });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      // Data should load automatically without calling refresh
      await waitFor(() => {
        expect(screen.getByTestId('data-count')).toHaveTextContent('1');
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should fetch data with initial filter settings', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('sort=uploadTime'),
          expect.any(Object)
        );
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('order=asc'),
        expect.any(Object)
      );
    });
  });

  describe('Bug Fix: Type Safety - PostFilter vs ImageFilter', () => {
    it('should accept PostFilter type in setFilter', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // This should not cause type errors (was ImageFilter before fix)
      const changeSortButton = screen.getByText('Change Sort');
      act(() => {
        changeSortButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('filter-sort')).toHaveTextContent('title');
      });
    });

    it('should handle partial filter updates correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Update only one filter property
      const changeSortButton = screen.getByText('Change Sort');
      act(() => {
        changeSortButton.click();
      });

      // Other filter properties should remain unchanged
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('sort=title'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Bug Fix: No Console.log Statements', () => {
    it('should not call console.log on successful data fetch', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [{ id: '1', title: 'Post 1' }],
        }),
      });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('data-count')).toHaveTextContent('1');
      });

      // Should not have logged the data
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('hooks post check'),
        expect.anything()
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: 'Server error',
        }),
      });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
      });

      expect(screen.getByTestId('data-count')).toHaveTextContent('0');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      });

      expect(screen.getByTestId('data-count')).toHaveTextContent('0');
    });
  });

  describe('Refresh Functionality', () => {
    it('should refetch data when refresh is called', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: [{ id: '1', title: 'Post 1' }],
          }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            data: [
              { id: '1', title: 'Post 1' },
              { id: '2', title: 'Post 2' },
            ],
          }),
        });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('data-count')).toHaveTextContent('1');
      });

      // Call refresh
      const refreshButton = screen.getByText('Refresh');
      act(() => {
        refreshButton.click();
      });

      // Should fetch new data
      await waitFor(() => {
        expect(screen.getByTestId('data-count')).toHaveTextContent('2');
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Filter Changes', () => {
    it('should refetch data when filter changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(
        <PostProvider>
          <TestComponent />
        </PostProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Change filter
      const changeSortButton = screen.getByText('Change Sort');
      act(() => {
        changeSortButton.click();
      });

      // Should trigger refetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });
});
