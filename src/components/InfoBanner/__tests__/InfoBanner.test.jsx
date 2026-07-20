import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InfoBanner from '../InfoBanner';

describe('InfoBanner', () => {
  it('renders the label and money-formatted value', () => {
    render(<InfoBanner label="Total" data={1234.5} />);
    expect(screen.getByText('Total: $1,234.50')).toBeInTheDocument();
  });

  it('formats a negative value with the currency sign preserved', () => {
    render(<InfoBanner label="Debt" data={-50} />);
    expect(screen.getByText('Debt: -$50.00')).toBeInTheDocument();
  });

  it('calls onDoubleClick when double-clicked', () => {
    const onDoubleClick = vi.fn();
    render(<InfoBanner label="Total" data={0} onDoubleClick={onDoubleClick} />);
    fireEvent.doubleClick(screen.getByText(/Total/));
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });
});
