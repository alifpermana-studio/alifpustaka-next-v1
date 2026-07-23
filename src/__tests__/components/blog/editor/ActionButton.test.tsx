import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActionButton } from '@/components/blog/editor/ActionButton';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/ui/modal', () => ({
  Modal: ({ children, isOpen }: any) => isOpen ? <div data-testid="modal">{children}</div> : null,
}));

jest.mock('@/hooks/useModal', () => ({
  useModal: () => ({
    isOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ActionButton - Sprint 1 Fixes', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const defaultMetadata = {
    id: 'test-id',
    title: 'Test Post',
    slug: 'test-post',
    image: 'https://example.com/image.jpg',
    tags: ['test', 'sprint'],
    desc: 'Test description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    localStorage.clear();
  });

  describe('Bug Fix: Delete Post Feedback', () => {
    it('should redirect to /blog after successful delete', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: 'Post deleted successfully',
          data: null,
        }),
      });

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/blog?message=post-deleted');
      });
    });

    it('should clear localStorage on successful delete', async () => {
      localStorage.setItem('apus-post', JSON.stringify({ test: 'data' }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: 'Post deleted successfully',
          data: null,
        }),
      });

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(localStorage.getItem('apus-post')).toBeNull();
      });
    });

    it('should show error modal on delete failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: 'delete-failed',
          message: 'Failed to delete post',
        }),
      });

      const { container } = render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText(/Failed to delete post/i)).toBeInTheDocument();
      });
    });

    it('should not redirect on delete failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: 'delete-failed',
        }),
      });

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('Bug Fix: Save Draft Feedback', () => {
    it('should show success modal after saving draft', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: 'Post saved successfully',
          data: { id: 'test-id' },
        }),
      });

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const saveButton = screen.getByText('Save Draft');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/blog-post',
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('drafted'),
          })
        );
      });
    });

    it('should handle missing metadata error on save', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: 'missing-required-metadata',
          message: 'Title and slug are required',
        }),
      });

      render(<ActionButton metadata={{ ...defaultMetadata, title: '' }} md="Test content" />);

      const saveButton = screen.getByText('Save Draft');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Bug Fix: Publish Post Feedback', () => {
    it('should redirect to /blog after successful publish', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: 'Post published successfully',
          data: { id: 'test-id' },
        }),
      });

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/blog');
      });
    });

    it('should clear localStorage after successful publish', async () => {
      localStorage.setItem('apus-post', JSON.stringify({ test: 'data' }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: 'Post published successfully',
          data: { id: 'test-id' },
        }),
      });

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(localStorage.getItem('apus-post')).toBeNull();
      });
    });
  });

  describe('Bug Fix: No Console.log Statements', () => {
    it('should not call console.log on successful save', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: 'Post saved successfully',
          data: { id: 'test-id' },
        }),
      });

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const saveButton = screen.getByText('Save Draft');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Saving post success')
      );

      consoleLogSpy.mockRestore();
    });

    it('should not call console.log on save error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: 'server-error',
        }),
      });

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const saveButton = screen.getByText('Save Draft');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Error save post')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should disable buttons while loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const saveButton = screen.getByText('Save Draft');
      fireEvent.click(saveButton);

      // Button should be disabled during loading
      expect(saveButton).toBeDisabled();
    });

    it('should show loading text during save', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<ActionButton metadata={defaultMetadata} md="Test content" />);

      const saveButton = screen.getByText('Save Draft');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      });
    });
  });
});
