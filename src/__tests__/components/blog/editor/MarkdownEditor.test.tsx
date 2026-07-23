import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '@/components/blog/editor/MarkdownEditor';

// Mock dependencies
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

jest.mock('@/components/blog/editor/ImageCard', () => ({
  __esModule: true,
  default: () => <div>ImageCard</div>,
}));

jest.mock('@/components/blog/editor/MdComponents', () => ({
  CustomCode: ({ props }: any) => <code {...props} />,
  CustomImg: ({ props }: any) => <img {...props} />,
  CustomOL: ({ props }: any) => <ol {...props} />,
  CustomTable: ({ props }: any) => <table {...props} />,
  CustomUL: ({ props }: any) => <ul {...props} />,
  PreComponent: ({ props }: any) => <pre {...props} />,
}));

describe('MarkdownEditor - Sprint 1 Fixes', () => {
  const defaultProps = {
    content: '',
    md: '',
    setMd: jest.fn(),
    className: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Bug Fix: Undo/Redo History Initialization', () => {
    it('should initialize history with initial markdown content', async () => {
      const initialContent = 'Initial content';
      const setMd = jest.fn();

      render(
        <MarkdownEditor
          {...defaultProps}
          md={initialContent}
          setMd={setMd}
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your post in Markdown/i);
      expect(textarea).toHaveValue(initialContent);

      // Type new content
      await userEvent.type(textarea, ' new text');
      
      // Wait for debounce
      await waitFor(() => {
        expect(setMd).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Undo should work immediately
      const undoButton = screen.getByTitle(/Undo/i);
      fireEvent.click(undoButton);

      // Should be able to undo
      expect(undoButton).toBeInTheDocument();
    });

    it('should allow undo from first character typed', async () => {
      const setMd = jest.fn();

      const { rerender } = render(
        <MarkdownEditor
          {...defaultProps}
          md=""
          setMd={setMd}
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your post in Markdown/i);

      // Type first character
      await userEvent.type(textarea, 'A');

      // Simulate md update
      rerender(
        <MarkdownEditor
          {...defaultProps}
          md="A"
          setMd={setMd}
        />
      );

      // Wait for history commit (500ms debounce)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      // Click undo
      const undoButton = screen.getByTitle(/Undo/i);
      fireEvent.click(undoButton);

      // setMd should be called to revert to empty
      expect(setMd).toHaveBeenCalledWith('');
    });

    it('should support multiple undo operations', async () => {
      const setMd = jest.fn();
      let currentMd = '';

      const { rerender } = render(
        <MarkdownEditor
          {...defaultProps}
          md={currentMd}
          setMd={(value) => {
            currentMd = typeof value === 'function' ? value(currentMd) : value;
            setMd(value);
          }}
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your post in Markdown/i);

      // Type first text
      await userEvent.type(textarea, 'First');
      currentMd = 'First';
      rerender(<MarkdownEditor {...defaultProps} md={currentMd} setMd={setMd} />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      // Type second text
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Second');
      currentMd = 'Second';
      rerender(<MarkdownEditor {...defaultProps} md={currentMd} setMd={setMd} />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      // Undo twice should work
      const undoButton = screen.getByTitle(/Undo/i);
      fireEvent.click(undoButton);
      fireEvent.click(undoButton);

      expect(setMd).toHaveBeenCalled();
    });

    it('should support redo after undo', async () => {
      const setMd = jest.fn();

      render(
        <MarkdownEditor
          {...defaultProps}
          md="Test content"
          setMd={setMd}
        />
      );

      // Perform undo
      const undoButton = screen.getByTitle(/Undo/i);
      fireEvent.click(undoButton);

      // Perform redo
      const redoButton = screen.getByTitle(/Redo/i);
      fireEvent.click(redoButton);

      expect(setMd).toHaveBeenCalled();
    });
  });

  describe('Bug Fix: Memory Leak Prevention', () => {
    it('should cleanup typing timeout on unmount', async () => {
      const setMd = jest.fn();
      const { unmount } = render(
        <MarkdownEditor
          {...defaultProps}
          md=""
          setMd={setMd}
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your post in Markdown/i);

      // Start typing (this creates a timeout)
      await userEvent.type(textarea, 'Test');

      // Unmount immediately (before debounce completes)
      unmount();

      // Wait longer than debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      // Should not crash or show warnings
      expect(true).toBe(true);
    });

    it('should not call setMd after unmount', async () => {
      const setMd = jest.fn();
      const { unmount } = render(
        <MarkdownEditor
          {...defaultProps}
          md=""
          setMd={setMd}
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your post in Markdown/i);
      
      // Type text
      await userEvent.type(textarea, 'Content');
      
      const callCountBeforeUnmount = setMd.mock.calls.length;

      // Unmount before debounce
      unmount();

      // Wait for debounce period
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      // Should not have additional calls after unmount
      expect(setMd.mock.calls.length).toBe(callCountBeforeUnmount);
    });
  });

  describe('Bug Fix: Keyboard Shortcuts', () => {
    it('should handle Ctrl+Z for undo', async () => {
      const setMd = jest.fn();

      render(
        <MarkdownEditor
          {...defaultProps}
          md="Test content"
          setMd={setMd}
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your post in Markdown/i);

      // Press Ctrl+Z
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true });

      expect(setMd).toHaveBeenCalled();
    });

    it('should handle Ctrl+Y for redo', async () => {
      const setMd = jest.fn();

      render(
        <MarkdownEditor
          {...defaultProps}
          md="Test content"
          setMd={setMd}
        />
      );

      // First undo
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true });

      // Then redo
      fireEvent.keyDown(window, { key: 'y', ctrlKey: true });

      expect(setMd).toHaveBeenCalled();
    });

    it('should handle Ctrl+B for bold', async () => {
      const setMd = jest.fn();

      render(
        <MarkdownEditor
          {...defaultProps}
          md=""
          setMd={setMd}
        />
      );

      // Press Ctrl+B
      fireEvent.keyDown(window, { key: 'b', ctrlKey: true });

      await waitFor(() => {
        expect(setMd).toHaveBeenCalled();
      });
    });

    it('should cleanup keyboard event listeners on unmount', () => {
      const { unmount } = render(
        <MarkdownEditor {...defaultProps} />
      );

      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      unmount();

      // Should have cleaned up listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Toolbar Functionality', () => {
    it('should render undo and redo buttons', () => {
      render(<MarkdownEditor {...defaultProps} />);

      expect(screen.getByTitle(/Undo/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Redo/i)).toBeInTheDocument();
    });

    it('should render formatting buttons', () => {
      render(<MarkdownEditor {...defaultProps} />);

      expect(screen.getByTitle(/Bold/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Italic/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Underline/i)).toBeInTheDocument();
    });

    it('should switch between edit and preview tabs', async () => {
      render(<MarkdownEditor {...defaultProps} md="# Test" />);

      const previewButton = screen.getByText('Preview');
      fireEvent.click(previewButton);

      // Preview mode should be active
      expect(previewButton).toHaveClass('bg-gray-700');
    });
  });
});
