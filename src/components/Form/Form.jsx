import { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Table from '../Table/Table';
import './Form.css';
import GlobalContext from '../../contexts/GlobalContext.jsx';
import { translateApiMessage } from '../../hooks/useLanguage';
import { onNativeInvalid, onNativeInput } from '../../helpers/nativeValidation';

const MAX_MOVEMENT_VAL = 10000000000;

/** Adds thousands separators to a raw "1234.5"-style numeric string for display. */
const formatWithThousands = (rawValue) => {
  const str = String(rawValue ?? '');
  if (str === '') return '';
  const [intPart, decPart] = str.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};

function Form({ setForm, form, edit, setEdit, currency, operateFor }) {
  const { setInit, init, setProc, proc, t } = useContext(GlobalContext);
  const [msg, setMsg] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [visible, setVisible] = useState(false);
  const [off, setOff] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const buttonRef = useRef(null);
  const movementValInputRef = useRef(null);
  const movementValCursorDigits = useRef(null);

  const initialForm = useMemo(
    () => ({
      movement_name: '',
      movement_val: '',
      operate_for: '',
      movement_type: '',
      movement_date: '',
      movement_tag: '',
      currency: '',
    }),
    []
  );

  useEffect(() => {
    function readOfflineData() {
      const insertData = JSON.parse(localStorage.getItem('insert')) || [];
      const updateData = JSON.parse(localStorage.getItem('update')) || [];
      const deleteData = JSON.parse(localStorage.getItem('del')) || [];
      const mergedData = formatOffData([...insertData, ...updateData, ...deleteData]);
      setOff(mergedData);
    }
    readOfflineData();
  }, []);

  const handleResetForm = useCallback(() => {
    setForm(initialForm);
    setEdit(false);
  }, [initialForm, setForm, setEdit]);

  const message = (msgText, msgColor, msgVisible) => {
    setMsg(msgText);
    setBgColor(msgColor);
    setVisible(msgVisible);
  };

  const formatOffData = (data) => {
    return data.map((obj) => {
      if (obj.id === undefined) {
        obj.id = null;
      }
      if (obj.source === undefined) {
        obj.source = null;
      }
      return obj;
    });
  };

  const handleChangeInput = useCallback(
    (e) => {
      const { name, value } = e.target;

      const emojiRegex =
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2500}-\u{257F}]/gu;

      if (emojiRegex.test(value)) {
        message(t('noEmoji'), 'var(--color-danger-alt)', true);
        return;
      }

      const sanitizedValue =
        name === 'movement_name' || name === 'movement_tag' ? value.replace(emojiRegex, '') : value;

      setForm((prevForm) => ({
        ...prevForm,
        [name]: sanitizedValue,
        currency: currency,
      }));
    },
    [currency, setForm, t]
  );

  // Reformats the value field with thousands separators as the user types,
  // while keeping form.movement_val as a plain unformatted numeric string
  // (data.service parses it with parseFloat, which can't handle commas).
  const handleMovementValChange = useCallback(
    (e) => {
      const input = e.target;
      const cursorPos = input.selectionStart;
      // Count everything but the comma separators we insert -- digits AND the
      // decimal point -- so the cursor lands after a just-typed "." instead
      // of snapping back in front of it (digit-only counting can't tell "." apart).
      const charsBeforeCursor = input.value.slice(0, cursorPos).replace(/,/g, '').length;

      let raw = input.value.replace(/[^\d.]/g, '');
      const firstDot = raw.indexOf('.');
      if (firstDot !== -1) {
        raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '');
      }

      if (raw !== '' && parseFloat(raw) > MAX_MOVEMENT_VAL) {
        return;
      }

      movementValCursorDigits.current = charsBeforeCursor;

      setForm((prevForm) => ({
        ...prevForm,
        movement_val: raw,
        currency: currency,
      }));
    },
    [currency, setForm]
  );

  useLayoutEffect(() => {
    const input = movementValInputRef.current;
    const charsBeforeCursor = movementValCursorDigits.current;
    if (!input || charsBeforeCursor === null || document.activeElement !== input) return;
    movementValCursorDigits.current = null;

    const formatted = formatWithThousands(form.movement_val);
    let pos = formatted.length;
    if (charsBeforeCursor === 0) {
      pos = 0;
    } else {
      let count = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== ',') {
          count++;
          if (count === charsBeforeCursor) {
            pos = i + 1;
            break;
          }
        }
      }
    }
    input.setSelectionRange(pos, pos);
  }, [form.movement_val]);

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      currency: currency,
    }));
  }, [currency, setForm]);

  const handleOfflineData = useCallback((type, data) => {
    data = formatOffData([data]);
    const existingData = JSON.parse(localStorage.getItem(type)) || [];
    existingData.push(data[0]);
    localStorage.setItem(type, JSON.stringify(existingData));
    setOff((prevOff) => [...prevOff, data[0]]);
  }, []);

  const handleBulkData = useCallback(
    async (type) => {
      const updatedData = [];
      for (const item of JSON.parse(localStorage.getItem(type)) || []) {
        const response = await DataService[type](item);
        response.err && updatedData.push(item) & setInit(false);
      }
      localStorage.setItem(type, JSON.stringify(updatedData));
      return updatedData;
    },
    [setInit]
  );

  const handleRowDoubleClick = useCallback(async () => {
    async function syncOfflineData() {
      if (init && !proc) {
        setProc(true);
        const updatedInsertArray = await handleBulkData('insert');
        const updatedUpdateArray = await handleBulkData('update');
        const UpdatedDeleteArray = await handleBulkData('del');
        let sum = [...updatedUpdateArray, ...updatedInsertArray, ...UpdatedDeleteArray];
        setOff(sum);
        if (sum?.length === 0) {
          message(t('transactionSuccessful'), 'var(--color-success)', true);
          setInit(Date.now());
        } else {
          message(t('transactionFailed'), 'var(--color-danger)', true);
          setInit(false);
        }
        setProc(false);
      } else {
        message(t('transactionWaiting'), 'var(--color-warning)', true);
      }
    }
    syncOfflineData();
  }, [handleBulkData, proc, setInit, setProc, init, t]);

  const handleOfflineRowEdit = useCallback(
    (itemToRemove) => {
      const types = ['insert', 'update', 'del'];
      for (const type of types) {
        const data = JSON.parse(localStorage.getItem(type)) || [];
        const index = data.findIndex(
          (item) =>
            item.movement_name === itemToRemove.movement_name &&
            item.movement_val === itemToRemove.movement_val &&
            item.movement_date === itemToRemove.movement_date
        );
        if (index !== -1) {
          data.splice(index, 1);
          localStorage.setItem(type, JSON.stringify(data));
          break;
        }
      }

      const insertData = JSON.parse(localStorage.getItem('insert')) || [];
      const updateData = JSON.parse(localStorage.getItem('update')) || [];
      const deleteData = JSON.parse(localStorage.getItem('del')) || [];
      const mergedData = formatOffData([...insertData, ...updateData, ...deleteData]);
      setOff(mergedData);

      setForm({
        id: itemToRemove.id || '',
        movement_name: itemToRemove.movement_name || '',
        movement_val: itemToRemove.movement_val || '',
        operate_for: itemToRemove.operate_for || '',
        movement_type: itemToRemove.movement_type || '',
        movement_date: itemToRemove.movement_date || '',
        movement_tag: itemToRemove.movement_tag || '',
        currency: itemToRemove.currency || '',
      });
      setEdit(!!itemToRemove.id);
    },
    [setForm, setEdit]
  );

  const handleOfflineRowDelete = useCallback(
    (itemToRemove) => {
      // Pedir confirmación al usuario
      if (!window.confirm(`${t('areYouSure')} '${itemToRemove.movement_name}'?`)) return;

      const types = ['insert', 'update', 'del'];

      // Buscar en cada categoría del localStorage para eliminar el registro
      for (const type of types) {
        const data = JSON.parse(localStorage.getItem(type)) || [];
        const index = data.findIndex(
          (item) =>
            item.movement_name === itemToRemove.movement_name &&
            item.movement_val === itemToRemove.movement_val &&
            item.movement_date === itemToRemove.movement_date
        );

        if (index !== -1) {
          data.splice(index, 1);
          localStorage.setItem(type, JSON.stringify(data));
          break; // Una vez encontrado y borrado, salimos del bucle
        }
      }

      // Refrescar el estado 'off' para que desaparezca de la tabla inmediatamente
      const insertData = JSON.parse(localStorage.getItem('insert')) || [];
      const updateData = JSON.parse(localStorage.getItem('update')) || [];
      const deleteData = JSON.parse(localStorage.getItem('del')) || [];
      const mergedData = formatOffData([...insertData, ...updateData, ...deleteData]);
      setOff(mergedData);

      message(t('transactionSuccessful'), 'var(--color-success)', true);
    },
    [t, setOff]
  );

  const handleAction = useCallback(
    async (e, actionType) => {
      e.target instanceof HTMLFormElement && e.preventDefault();
      async function exeAction(actionType) {
        if (init && !proc) {
          setProc(true);
          setDisabled(true);
          off.length !== 0 && handleRowDoubleClick();
          const response = await DataService[actionType](form);
          if (response?.err) {
            message(translateApiMessage(t, response.err.message), 'var(--color-danger)', true);
            handleOfflineData(actionType, form);
            setInit(false);
          } else {
            message(t('transactionSuccessful'), 'var(--color-success)', true);
            setInit(Date.now());
          }
          setDisabled(false);
          setProc(false);
        } else {
          handleOfflineData(actionType, form);
          message(t('transactionWaiting'), 'var(--color-warning)', true);
        }
        handleResetForm();
      }

      if (actionType === 'del') {
        window.confirm(`${t('areYouSure')} '${form.movement_name}'`) && exeAction(actionType);
      } else {
        actionType = edit ? 'update' : 'insert';
        exeAction(actionType);
      }
    },
    [edit, proc, setProc, handleResetForm, form, handleOfflineData, setInit, init, off, handleRowDoubleClick, t]
  );

  return (
    <div>
      <AutoDismissMessage msg={msg} bgColor={bgColor} duration={4000} visible={visible} setVisible={setVisible} />
      <form onSubmit={(e) => handleAction(e, '')}>
        <input type="hidden" name="currency" onChange={handleChangeInput} value={currency} />
        <div className="form-group">
          <label className="form-label" htmlFor="movement_name">
            {t('name')}
          </label>
          <input
            id="movement_name"
            type="text"
            className="form-control"
            name="movement_name"
            value={form.movement_name}
            onChange={handleChangeInput}
            onInvalid={(e) => onNativeInvalid(e, t)}
            onInput={onNativeInput}
            maxLength="50"
            minLength="2"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_val">
            {t('value')}
          </label>
          <input
            id="movement_val"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className="form-control"
            name="movement_val"
            ref={movementValInputRef}
            value={formatWithThousands(form.movement_val)}
            onChange={handleMovementValChange}
            onInvalid={(e) => onNativeInvalid(e, t)}
            onInput={onNativeInput}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_type">
            {t('type')}
          </label>
          <select
            id="movement_type"
            className="form-control select"
            name="movement_type"
            onChange={handleChangeInput}
            value={form.movement_type}
            ref={buttonRef}
            onInvalid={(e) => onNativeInvalid(e, t)}
            onInput={onNativeInput}
            required
          >
            <option value="">---</option>
            <option value="2">{t('expenses')}</option>
            <option value="1">{t('incomes')}</option>
            <option value="8">{t('balance')}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="operate_for">
            {t('origin')}
          </label>
          <select
            id="operate_for"
            className="form-control select"
            name="operate_for"
            onChange={handleChangeInput}
            value={form.operate_for}
            ref={buttonRef}
          >
            <option value="">---</option>
            {[...operateFor].map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_date">
            {t('date')}
          </label>
          <input
            className="form-control"
            type="datetime-local"
            id="movement_date"
            name="movement_date"
            value={form.movement_date}
            onChange={handleChangeInput}
            onInvalid={(e) => onNativeInvalid(e, t)}
            onInput={onNativeInput}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_tag">
            {t('tag')}
          </label>
          <input
            id="movement_tag"
            type="text"
            className="form-control"
            name="movement_tag"
            value={form.movement_tag}
            onChange={handleChangeInput}
            onInvalid={(e) => onNativeInvalid(e, t)}
            onInput={onNativeInput}
            maxLength="30"
            required
          />
        </div>

        <div className="form-group">
          <div className="form-actions">
            <input type="submit" className="btn-primarys" value={t('submit')} disabled={disabled}></input>
            <input className="btn-primarys" type="reset" value={t('reset')} onClick={handleResetForm} />
          </div>
          {edit && (
            <input
              className="delete-button"
              type="button"
              value={t('delete')}
              onClick={(e) => handleAction(e, 'del')}
            />
          )}
        </div>
      </form>
      {off.length !== 0 && (
        <Table
          label={t('offlineTable')}
          columns={[t('queue'), '', '', '', '', '', '', '', '...']}
          data={off}
          onRowDoubleClick={handleRowDoubleClick}
          onRowEdit={handleOfflineRowEdit}
          onRowDelete={handleOfflineRowDelete}
        />
      )}
    </div>
  );
}

Form.propTypes = {
  setForm: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  edit: PropTypes.bool.isRequired,
  setEdit: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  operateFor: PropTypes.any.isRequired,
};

export default Form;
