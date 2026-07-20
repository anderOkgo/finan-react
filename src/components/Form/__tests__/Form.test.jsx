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
function FormHarness({ contextValue, currency = 'COP', operateFor = [], initialEdit = false }) {
  const [form, setForm] = useState(blankForm);
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
    // Real (surprising) behavior, not a guess: handleChangeInput's emoji
    // check does `if (emojiRegex.test(value)) { message(...); return; }`
    // BEFORE the `sanitizedValue = value.replace(emojiRegex, '')` line --
    // so that stripping line is unreachable dead code for movement_name/
    // movement_tag; any keystroke that makes the value contain an emoji
    // is rejected outright (setForm is never called), not sanitized.
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
    expect(screen.getByLabelText('value')).toHaveValue(10);
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
});
