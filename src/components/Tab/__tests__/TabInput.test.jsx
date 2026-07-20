import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TabInput from '../TabInput';

vi.mock('../../Form/Form', () => ({
  default: ({ form }) => <div data-testid="form-mock">form:{form.movement_name}</div>,
}));

const t = (key) => key;

describe('TabInput', () => {
  it('shows the daily-expenses InfoBanner and renders Form', () => {
    render(
      <TabInput
        totalDay={99.5}
        setForm={vi.fn()}
        form={{ movement_name: 'Coffee' }}
        edit={false}
        setEdit={vi.fn()}
        currency="COP"
        operateFor={[]}
        t={t}
      />
    );

    expect(screen.getByText('dailyExpenses: $99.50')).toBeInTheDocument();
    expect(screen.getByTestId('form-mock')).toHaveTextContent('form:Coffee');
  });
});
