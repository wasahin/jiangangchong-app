import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BackgroundThemeToggle } from '@/components/BackgroundThemeToggle';

describe('BackgroundThemeToggle', () => {
  it('renders with light theme by default', () => {
    render(<BackgroundThemeToggle />);

    expect(screen.getByLabelText(/current theme/i)).toBeInTheDocument();
    expect(screen.getByText('LIGHT')).toBeInTheDocument();
    expect(screen.getByText('RICH')).toBeInTheDocument();
  });

  it('toggles theme when clicked', async () => {
    render(<BackgroundThemeToggle />);

    const toggleButton = screen.getByLabelText(/current theme/i);
    const lightLabel = screen.getByText('LIGHT');
    const richLabel = screen.getByText('RICH');

    expect(lightLabel).toHaveStyle({ color: '#FFE8EC' });
    expect(richLabel).toHaveStyle({ color: '#9A9A9A' });

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(lightLabel).toHaveStyle({ color: '#9A9A9A' });
      expect(richLabel).toHaveStyle({ color: '#FFD4DA' });
    });
  });

  it('calls onThemeChange callback with correct theme', async () => {
    const mockOnThemeChange = jest.fn();

    render(<BackgroundThemeToggle onThemeChange={mockOnThemeChange} />);

    const toggleButton = screen.getByLabelText(/current theme/i);

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
      expect(mockOnThemeChange).toHaveBeenCalledWith('rich');
    });

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(mockOnThemeChange).toHaveBeenCalledTimes(2);
      expect(mockOnThemeChange).toHaveBeenCalledWith('light');
    });
  });

  it('renders correctly with different sizes', () => {
    const { container } = render(<BackgroundThemeToggle size="sm" />);
    const button = container.querySelector('button');
    expect(button).toHaveClass('h-8', 'w-16');
  });

  it('hides labels when showLabels is false', () => {
    render(<BackgroundThemeToggle showLabels={false} />);

    expect(screen.queryByText('LIGHT')).not.toBeInTheDocument();
    expect(screen.queryByText('RICH')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<BackgroundThemeToggle className="custom-class" />);
    const wrapper = container.querySelector('div.inline-flex');
    expect(wrapper).toHaveClass('custom-class');
  });
});
