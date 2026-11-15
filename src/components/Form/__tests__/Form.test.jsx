import { vi } from 'vitest';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Form from '../Form';
import GlobalContext from '../../../contexts/GlobalContext';

vi.mock('../../../services/data.service', () => ({
  default: { insert: vi.fn(), update: vi.fn(), del: vi.fn(), initialLoad: vi.fn(), boot: vi.fn() },
}));
import DataService from '../../../services/data.service';

// AutoDismissMessage renders on a requestAnimationFrame-driven opacity
// tween unrelated to Form's own logic -- stub it to a plain text node so
// message-content assertions don't depend on jsdom's rAF behavior.
vi.mock('../../Message/AutoDismissMessage.jsx', () => ({
  default: ({ msg, visible }) => (visible ? <div data-testid="message">{msg}</div> : null),
}));

const t = (key) => key;
const blankForm = {
  movement_name: '',
  movement_val: '',
  operate_for: '',
  movement_type: '',
  movement_date: '',
  movement_tag: '',
  currency: '',
};

// Stateful harness: Form is a fully controlled component (form/setForm,
// edit/setEdit all come from the parent), so a real parent-state wrapper
// is needed to exercise typing, reset, and edit-mode toggling faithfully.
function FormHarness({ contextValue, currency = 'COP', operateFor = [], initialEdit = false, startForm = blankForm }) {
  const [form, setForm] = useState(startForm);
  const [edit, setEdit] = useState(initialEdit);
  return (
    <GlobalContext.Provider value={contextValue}>
      <Form setForm={setForm} form={form} edit={edit} setEdit={setEdit} currency={currency} operateFor={operateFor} />
    </GlobalContext.Provider>
  );
}

FormHarness.propTypes = {
  contextValue: PropTypes.object.isRequired,
  currency: PropTypes.string,
  operateFor: PropTypes.array,
  initialEdit: PropTypes.bool,
  startForm: PropTypes.object,
};

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText('name'), { target: { name: 'movement_name', value: 'Groceries' } });
  fireEvent.change(screen.getByLabelText('value'), { target: { name: 'movement_val', value: '42.5' } });
  fireEvent.change(screen.getByLabelText('type'), { target: { name: 'movement_type', value: '2' } });
  fireEvent.change(screen.getByLabelText('date'), { target: { name: 'movement_date', value: '2024-01-15T10:00' } });
  fireEvent.change(screen.getByLabelText('tag'), { target: { name: 'movement_tag', value: 'food' } });
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Form input handling', () => {
  it('updates a field on a normal keystroke', () => {
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);
    fireEvent.change(screen.getByLabelText('name'), { target: { name: 'movement_name', value: 'Groceries' } });
    expect(screen.getByLabelText('name')).toHaveValue('Groceries');
  });

  it('rejects the whole keystroke when the value contains an emoji, instead of stripping just the emoji', () => {
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);
    fireEvent.change(screen.getByLabelText('name'), { target: { name: 'movement_name', value: 'Hi😀' } });
    expect(screen.getByLabelText('name')).toHaveValue('');
    expect(screen.getByTestId('message')).toHaveTextContent('noEmoji');
  });

  it('resets the form to blank via the Reset button', () => {
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);
    fillRequiredFields();
    expect(screen.getByLabelText('name')).toHaveValue('Groceries');

    fireEvent.click(screen.getByDisplayValue('reset'));
    expect(screen.getByLabelText('name')).toHaveValue('');
  });
});

describe('Form submit -- online', () => {
  it('inserts a new movement and shows a success message on a clean response', async () => {
    DataService.insert.mockResolvedValue({});
    const setInit = vi.fn();
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit, setProc: vi.fn() }} />);

    fillRequiredFields();
    fireEvent.click(screen.getByDisplayValue('submit'));

    await waitFor(() => expect(DataService.insert).toHaveBeenCalled());
    expect(DataService.update).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('transactionSuccessful'));
    expect(setInit).toHaveBeenCalled();
    // Form clears back to blank after a successful submit.
    await waitFor(() => expect(screen.getByLabelText('name')).toHaveValue(''));
  });

  it('queues the movement offline and shows the API error when the request fails', async () => {
    DataService.insert.mockResolvedValue({ err: { message: 'Network Error' } });
    const setInit = vi.fn();
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit, setProc: vi.fn() }} />);

    fillRequiredFields();
    fireEvent.click(screen.getByDisplayValue('submit'));

    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('Network Error'));
    expect(setInit).toHaveBeenCalledWith(false);
    expect(JSON.parse(localStorage.getItem('insert'))).toHaveLength(1);
  });

  it('updates instead of inserting when in edit mode', async () => {
    DataService.update.mockResolvedValue({});
    render(
      <FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} initialEdit />
    );

    fillRequiredFields();
    fireEvent.click(screen.getByDisplayValue('submit'));

    await waitFor(() => expect(DataService.update).toHaveBeenCalled());
    expect(DataService.insert).not.toHaveBeenCalled();
  });

  it('asks for confirmation and calls DataService.del on the Delete button, in edit mode', async () => {
    DataService.del.mockResolvedValue({});
    render(
      <FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} initialEdit />
    );

    fireEvent.click(screen.getByDisplayValue('delete'));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(DataService.del).toHaveBeenCalled());
  });

  it('does not delete when the user declines the confirmation', () => {
    window.confirm.mockReturnValue(false);
    render(
      <FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} initialEdit />
    );

    fireEvent.click(screen.getByDisplayValue('delete'));

    expect(DataService.del).not.toHaveBeenCalled();
  });
});

describe('Form submit -- offline / busy', () => {
  it('queues the movement locally and shows a waiting message when not initialized (offline)', () => {
    render(<FormHarness contextValue={{ t, init: false, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);

    fillRequiredFields();
    fireEvent.click(screen.getByDisplayValue('submit'));

    expect(DataService.insert).not.toHaveBeenCalled();
    expect(screen.getByTestId('message')).toHaveTextContent('transactionWaiting');
    expect(JSON.parse(localStorage.getItem('insert'))).toHaveLength(1);
  });

  it('queues the movement locally and shows a waiting message when a sync is already in progress', () => {
    render(<FormHarness contextValue={{ t, init: true, proc: true, setInit: vi.fn(), setProc: vi.fn() }} />);

    fillRequiredFields();
    fireEvent.click(screen.getByDisplayValue('submit'));

    expect(DataService.insert).not.toHaveBeenCalled();
    expect(screen.getByTestId('message')).toHaveTextContent('transactionWaiting');
  });
});

describe('Offline queue loaded on mount', () => {
  it('reads previously-queued insert/update/del entries from localStorage and renders them', () => {
    localStorage.setItem('insert', JSON.stringify([{ movement_name: 'Queued item', movement_val: '10' }]));

    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);

    expect(screen.getByText('offlineTable')).toBeInTheDocument();
  });
});

describe('Offline queue sync (handleRowDoubleClick / handleBulkData)', () => {
  const queueOneInsert = () =>
    localStorage.setItem(
      'insert',
      JSON.stringify([{ movement_name: 'Queued item', movement_val: '10', movement_date: '2024-01-01T00:00' }])
    );

  it('syncs every queued type via DataService and clears the queue on full success', async () => {
    queueOneInsert();
    DataService.insert.mockResolvedValue({});
    const setInit = vi.fn();
    const setProc = vi.fn();
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit, setProc }} />);

    fireEvent.doubleClick(document.querySelector('tbody tr'));

    await waitFor(() => expect(DataService.insert).toHaveBeenCalledTimes(1));
    // handleBulkData iterates the queue *items*, not the queue types -- an
    // empty update/del queue means DataService.update/.del are never
    // invoked at all (not "called with an empty item"), only .insert is.
    expect(DataService.update).not.toHaveBeenCalled();
    expect(DataService.del).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('transactionSuccessful'));
    expect(setInit).toHaveBeenCalledWith(expect.any(Number));
    expect(setProc).toHaveBeenLastCalledWith(false);
    expect(JSON.parse(localStorage.getItem('insert'))).toEqual([]);
    // The offline table itself disappears once the queue (`off`) is empty.
    await waitFor(() => expect(screen.queryByText('offlineTable')).not.toBeInTheDocument());
  });

  it('keeps a failed item queued and reports transactionFailed instead of clearing it', async () => {
    queueOneInsert();
    DataService.insert.mockResolvedValue({ err: { message: 'still offline' } });
    const setInit = vi.fn();
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit, setProc: vi.fn() }} />);

    fireEvent.doubleClick(document.querySelector('tbody tr'));

    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('transactionFailed'));
    expect(JSON.parse(localStorage.getItem('insert'))).toHaveLength(1);
    expect(screen.getByText('offlineTable')).toBeInTheDocument();
    expect(setInit).toHaveBeenLastCalledWith(false);
  });

  it('shows transactionWaiting and never calls DataService when offline or a sync is already running', () => {
    queueOneInsert();
    const { rerender } = render(
      <FormHarness contextValue={{ t, init: false, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />
    );
    fireEvent.doubleClick(document.querySelector('tbody tr'));
    expect(screen.getByTestId('message')).toHaveTextContent('transactionWaiting');
    expect(DataService.insert).not.toHaveBeenCalled();

    rerender(<FormHarness contextValue={{ t, init: true, proc: true, setInit: vi.fn(), setProc: vi.fn() }} />);
    fireEvent.doubleClick(document.querySelector('tbody tr'));
    expect(screen.getByTestId('message')).toHaveTextContent('transactionWaiting');
    expect(DataService.insert).not.toHaveBeenCalled();
  });
});

describe('Offline queue row actions (edit / delete)', () => {
  const queueOneInsert = () =>
    localStorage.setItem(
      'insert',
      JSON.stringify([
        { movement_name: 'Queued item', movement_val: '10', movement_date: '2024-01-01T00:00', movement_tag: 'x' },
      ])
    );

  it('loads a queued row back into the form for editing, via the row edit button', () => {
    queueOneInsert();
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);

    fireEvent.click(screen.getByTitle('edit'));

    expect(screen.getByLabelText('name')).toHaveValue('Queued item');
    expect(screen.getByLabelText('value')).toHaveValue('10');
    // It's also removed from whichever queue it came from at the same time.
    expect(JSON.parse(localStorage.getItem('insert'))).toEqual([]);
  });

  it('removes a queued row on delete, after confirmation', () => {
    queueOneInsert();
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);

    fireEvent.click(screen.getByTitle('delete'));

    expect(window.confirm).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('insert'))).toEqual([]);
    expect(screen.queryByText('offlineTable')).not.toBeInTheDocument();
    expect(screen.getByTestId('message')).toHaveTextContent('transactionSuccessful');
  });

  it('does not remove the queued row when the delete confirmation is declined', () => {
    queueOneInsert();
    window.confirm.mockReturnValue(false);
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);

    fireEvent.click(screen.getByTitle('delete'));

    expect(JSON.parse(localStorage.getItem('insert'))).toHaveLength(1);
    expect(screen.getByText('offlineTable')).toBeInTheDocument();
  });

  it('finds a queued row in the update or del queue, and fills missing fields with blanks', () => {
    // Only the update and del queues exist: the insert queue is absent from storage
    localStorage.setItem('update', JSON.stringify([{ id: 7, source: 'web', movement_name: 'Edited' }]));
    localStorage.setItem('del', JSON.stringify([{ id: 9, movement_name: 'Removed', movement_val: '5' }]));
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);

    fireEvent.click(screen.getAllByTitle('edit')[1]); // the del row
    expect(screen.getByLabelText('name')).toHaveValue('Removed');
    expect(JSON.parse(localStorage.getItem('del'))).toEqual([]);
    // A row with an id opens the form in edit mode
    expect(screen.getByDisplayValue('delete')).toBeInTheDocument();

    fireEvent.click(screen.getAllByTitle('edit')[0]); // the update row, with no value, date or tag
    expect(screen.getByLabelText('name')).toHaveValue('Edited');
    expect(screen.getByLabelText('value')).toHaveValue('');
    expect(screen.getByLabelText('tag')).toHaveValue('');
  });

  it('deletes a queued row found in the update queue when there is no insert queue', () => {
    localStorage.setItem('update', JSON.stringify([{ movement_name: 'Edited', movement_val: '1', movement_date: 'd' }]));
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);
    fireEvent.click(screen.getByTitle('delete'));
    expect(JSON.parse(localStorage.getItem('update'))).toEqual([]);
    expect(screen.queryByText('offlineTable')).not.toBeInTheDocument();
  });

  it('fills a blank name for a queued row that has none', () => {
    localStorage.setItem('insert', JSON.stringify([{ movement_val: '3', movement_date: 'd' }]));
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);
    fireEvent.click(screen.getByTitle('edit'));
    expect(screen.getByLabelText('name')).toHaveValue('');
    expect(screen.getByLabelText('value')).toHaveValue('3');
  });

  it('edits a row in the offline table that is in no queue any more', () => {
    localStorage.setItem('insert', JSON.stringify([{ movement_name: 'Gone', movement_val: '1', movement_date: 'd' }]));
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);
    localStorage.clear(); // removed elsewhere after the table was drawn
    fireEvent.click(screen.getByTitle('edit'));
    expect(screen.getByLabelText('name')).toHaveValue('Gone');
  });

  it('deletes a row in the offline table that is in no queue any more', () => {
    localStorage.setItem('insert', JSON.stringify([{ movement_name: 'Gone', movement_val: '1', movement_date: 'd' }]));
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);
    localStorage.clear();
    fireEvent.click(screen.getByTitle('delete'));
    expect(screen.queryByText('offlineTable')).not.toBeInTheDocument();
  });
});

describe('Form value field', () => {
  const online = { t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() };
  const typeValue = (input, value, cursor = value.length) => {
    input.focus();
    fireEvent.change(input, { target: { value, selectionStart: cursor, selectionEnd: cursor } });
  };

  it('shows an empty field when the value is missing', () => {
    const { movement_val: _omitted, ...withoutValue } = blankForm;
    render(<FormHarness contextValue={online} startForm={withoutValue} />);
    expect(screen.getByLabelText('value')).toHaveValue('');
  });

  it('keeps digits and the first decimal point, with thousands separators', () => {
    render(<FormHarness contextValue={online} />);
    const input = screen.getByLabelText('value');
    typeValue(input, '1a234567.8.9');
    expect(input).toHaveValue('1,234,567.89');
    expect(input.selectionStart).toBe(input.value.length);
  });

  it('ignores a value above the maximum', () => {
    render(<FormHarness contextValue={online} />);
    const input = screen.getByLabelText('value');
    typeValue(input, '5000');
    typeValue(input, '99999999999');
    expect(input).toHaveValue('5,000');
  });

  it('keeps the cursor in place among the separators', () => {
    render(<FormHarness contextValue={online} />);
    const input = screen.getByLabelText('value');
    typeValue(input, '1234567', 3); // cursor after "123"
    expect(input).toHaveValue('1,234,567');
    expect(input.selectionStart).toBe(4); // after "1,23"
  });

  it('puts the cursor at the start when it was there', () => {
    render(<FormHarness contextValue={online} />);
    const input = screen.getByLabelText('value');
    typeValue(input, '1234', 0);
    expect(input.selectionStart).toBe(0);
  });

  it('puts the cursor at the end when the characters before it were dropped', () => {
    render(<FormHarness contextValue={online} />);
    const input = screen.getByLabelText('value');
    typeValue(input, '12ab', 4);
    expect(input).toHaveValue('12');
    expect(input.selectionStart).toBe(2);
  });

  it('leaves the cursor alone when the field is not focused', () => {
    render(<FormHarness contextValue={online} />);
    const input = screen.getByLabelText('value');
    screen.getByLabelText('name').focus();
    fireEvent.change(input, { target: { value: '1234' } });
    expect(input).toHaveValue('1,234');
  });
});

describe('Form validation messages and origin options', () => {
  it('shows a translated message for each invalid field', () => {
    render(
      <FormHarness
        contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }}
        operateFor={[{ id: 3, name: 'Wallet' }]}
      />
    );
    ['name', 'value', 'type', 'date', 'tag'].forEach((label) => {
      const field = screen.getByLabelText(label);
      fireEvent.invalid(field);
      expect(field.validationMessage).not.toBe('');
    });
    expect(screen.getByRole('option', { name: 'Wallet' })).toHaveValue('3');
  });
});

describe('Form submit with a pending offline queue', () => {
  it('syncs the queue first, then sends the new movement', async () => {
    localStorage.setItem('insert', JSON.stringify([{ movement_name: 'Queued', movement_val: '1', movement_date: 'd' }]));
    DataService.insert.mockResolvedValue({});
    render(<FormHarness contextValue={{ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn() }} />);
    fillRequiredFields();
    fireEvent.click(screen.getByDisplayValue('submit'));
    await waitFor(() => expect(DataService.insert).toHaveBeenCalledTimes(2));
  });
});

describe('Deleted movements, kept 7 days on the device (SPEC v0.9, §2.2.1)', () => {
  const editing = {
    id: 42,
    movement_name: 'Lunch',
    movement_val: '25000',
    operate_for: '7',
    movement_type: '2',
    movement_date: '2026-11-14T12:30',
    movement_tag: 'food',
    currency: 'COP',
  };
  const keptRow = (overrides = {}) => ({
    key: 'k1',
    deletedAt: Date.now(),
    movement_name: 'Lunch',
    movement_val: '25000',
    movement_type: '2',
    movement_date: '2026-11-14T12:30',
    movement_tag: 'food',
    currency: 'COP',
    ...overrides,
  });
  const keep = (...rows) => localStorage.setItem('deleted', JSON.stringify(rows));
  const kept = () => JSON.parse(localStorage.getItem('deleted')) ?? [];
  const cells = () => [...document.querySelectorAll('td')].map((td) => td.textContent);
  const online = (extra = {}) => ({ t, init: true, proc: false, setInit: vi.fn(), setProc: vi.fn(), ...extra });

  it('H1: a delete that reaches the server shows in Deleted (1) with its fields', async () => {
    DataService.del.mockResolvedValue({});
    render(<FormHarness contextValue={online()} initialEdit startForm={editing} />);

    fireEvent.click(screen.getByDisplayValue('delete'));

    await waitFor(() => expect(screen.getByText('deletedTable (1)')).toBeInTheDocument());
    expect(cells()).toEqual(expect.arrayContaining(['Lunch', 'expenses', '2026-11-14 12:30', 'food']));
    expect(kept()).toHaveLength(1);
    // SPEC v0.10: the copy keeps the origin, so a restore applies the effect again
    expect(kept()[0].operate_for).toBe(7);
  });

  it('keeps nothing when the delete fails and waits in the Offline queue', async () => {
    DataService.del.mockResolvedValue({ err: { message: 'offline' } });
    render(<FormHarness contextValue={online()} initialEdit startForm={editing} />);

    fireEvent.click(screen.getByDisplayValue('delete'));

    await waitFor(() => expect(screen.getByText('offlineTable')).toBeInTheDocument());
    expect(screen.queryByText(/deletedTable/)).not.toBeInTheDocument();
    expect(kept()).toEqual([]);
  });

  it('J11: restoring sends the origin again', async () => {
    keep(keptRow({ operate_for: 7 }));
    DataService.insert.mockResolvedValue({});
    render(<FormHarness contextValue={online()} />);

    fireEvent.click(screen.getByTitle('restore'));

    await waitFor(() => expect(DataService.insert).toHaveBeenCalledTimes(1));
    expect(DataService.insert.mock.calls[0][0].operate_for).toBe(7);
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('transactionSuccessful'));
  });

  it('J12: when the origin no longer exists, it restores without it and says so', async () => {
    keep(keptRow({ operate_for: 7 }));
    DataService.insert
      .mockResolvedValueOnce({ err: { message: 'Linked movement not found' } })
      .mockResolvedValueOnce({});
    const setInit = vi.fn();
    render(<FormHarness contextValue={online({ setInit })} />);

    fireEvent.click(screen.getByTitle('restore'));

    await waitFor(() => expect(DataService.insert).toHaveBeenCalledTimes(2));
    expect('operate_for' in DataService.insert.mock.calls[1][0]).toBe(false);
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('restoredWithoutOrigin'));
    expect(setInit).toHaveBeenCalledWith(expect.any(Number));
    expect(localStorage.getItem('insert')).toBeNull();
  });

  it('a row with no origin that gets "Linked movement not found" is not retried', async () => {
    keep(keptRow());
    DataService.insert.mockResolvedValue({ err: { message: 'Linked movement not found' } });
    render(<FormHarness contextValue={online()} />);

    fireEvent.click(screen.getByTitle('restore'));

    await waitFor(() => expect(screen.getByText('offlineTable')).toBeInTheDocument());
    expect(DataService.insert).toHaveBeenCalledTimes(1);
  });

  it('H2, H3: restoring online sends it again as new, without id (no origin kept before v0.10), and empties the list', async () => {
    keep(keptRow());
    DataService.insert.mockResolvedValue({});
    const setInit = vi.fn();
    render(<FormHarness contextValue={online({ setInit })} />);

    fireEvent.click(screen.getByTitle('restore'));

    await waitFor(() => expect(DataService.insert).toHaveBeenCalledTimes(1));
    const request = DataService.insert.mock.calls[0][0];
    expect(request).toEqual({
      movement_name: 'Lunch',
      movement_val: '25000',
      movement_type: '2',
      movement_date: '2026-11-14T12:30',
      movement_tag: 'food',
      currency: 'COP',
    });
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('transactionSuccessful'));
    expect(setInit).toHaveBeenCalledWith(expect.any(Number));
    expect(screen.queryByText(/deletedTable/)).not.toBeInTheDocument();
    expect(localStorage.getItem('deleted')).toBeNull();
  });

  it('H4: restoring offline moves the row to the Offline queue', () => {
    keep(keptRow());
    render(<FormHarness contextValue={online({ init: false })} />);

    fireEvent.click(screen.getByTitle('restore'));

    expect(DataService.insert).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('insert'))).toHaveLength(1);
    expect(screen.getByText('offlineTable')).toBeInTheDocument();
    expect(screen.queryByText(/deletedTable/)).not.toBeInTheDocument();
    expect(screen.getByTestId('message')).toHaveTextContent('transactionWaiting');
  });

  it('a restore the API refuses waits in the Offline queue too', async () => {
    keep(keptRow());
    DataService.insert.mockResolvedValue({ err: { message: 'still offline' } });
    const setInit = vi.fn();
    render(<FormHarness contextValue={online({ setInit })} />);

    fireEvent.click(screen.getByTitle('restore'));

    await waitFor(() => expect(screen.getByText('offlineTable')).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('insert'))).toHaveLength(1);
    expect(setInit).toHaveBeenLastCalledWith(false);
    expect(kept()).toEqual([]);
  });

  it('H5: delete for good asks first, then removes the row and sends nothing', () => {
    keep(keptRow());
    window.confirm.mockReturnValueOnce(false);
    render(<FormHarness contextValue={online()} />);

    fireEvent.click(screen.getByTitle('delete'));
    expect(kept()).toHaveLength(1);
    expect(window.confirm).toHaveBeenLastCalledWith("areYouSureForGood: 'Lunch'?");

    fireEvent.click(screen.getByTitle('delete'));
    expect(kept()).toEqual([]);
    expect(screen.queryByText(/deletedTable/)).not.toBeInTheDocument();
    expect(DataService.del).not.toHaveBeenCalled();
    expect(DataService.insert).not.toHaveBeenCalled();
  });

  it('H6: a row 7 days old is neither listed nor kept when the form opens', () => {
    keep(keptRow({ key: 'old', deletedAt: Date.now() - 7 * 24 * 60 * 60 * 1000 - 1 }));
    render(<FormHarness contextValue={online()} />);
    expect(screen.queryByText(/deletedTable/)).not.toBeInTheDocument();
    expect(localStorage.getItem('deleted')).toBeNull();
  });

  it('H7: removing an unsent row from the Offline table does not keep it', () => {
    localStorage.setItem('insert', JSON.stringify([{ movement_name: 'Unsent', movement_val: '1', movement_date: 'd' }]));
    render(<FormHarness contextValue={online()} />);

    fireEvent.click(screen.getByTitle('delete'));

    expect(kept()).toEqual([]);
    expect(screen.queryByText(/deletedTable/)).not.toBeInTheDocument();
  });

  it('H8: a queued delete that syncs shows in Deleted', async () => {
    localStorage.setItem('del', JSON.stringify([editing]));
    DataService.del.mockResolvedValue({});
    render(<FormHarness contextValue={online()} />);

    fireEvent.doubleClick(document.querySelector('tbody tr'));

    await waitFor(() => expect(screen.getByText('deletedTable (1)')).toBeInTheDocument());
    expect(kept()[0].movement_name).toBe('Lunch');
  });

  it('shows a type it has no label for as its id', () => {
    keep(keptRow({ movement_type: '3' }));
    render(<FormHarness contextValue={online()} />);
    expect(cells()).toContain('3');
  });
});
