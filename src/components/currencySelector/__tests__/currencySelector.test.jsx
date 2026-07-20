import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CurrencySelector from '../currencySelector';

const t = (key) => key;

describe('CurrencySelector', () => {
  it('renders the current currency selected among COP/AUD', () => {
    render(<CurrencySelector currency="AUD" setCurrency={() => {}} t={t} />);
    expect(screen.getByRole('combobox')).toHaveValue('AUD');
  });

  it('calls setCurrency with the newly selected value', () => {
    const setCurrency = vi.fn();
    render(<CurrencySelector currency="COP" setCurrency={setCurrency} t={t} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'AUD' } });
    expect(setCurrency).toHaveBeenCalledWith('AUD');
  });

  it('associates the label with the select via a generated unique id', () => {
    render(<CurrencySelector currency="COP" setCurrency={() => {}} t={t} />);
    expect(screen.getByLabelText('selectCurrency')).toBe(screen.getByRole('combobox'));
  });
});
