import { getNativeValidationMessage } from '../nativeValidation';

const t = (key) => key;

const target = (validityOverrides, extra = {}) => ({
  tagName: 'INPUT',
  type: 'text',
  minLength: -1,
  maxLength: -1,
  min: '',
  max: '',
  ...extra,
  validity: {
    valid: false,
    valueMissing: false,
    tooShort: false,
    tooLong: false,
    rangeUnderflow: false,
    rangeOverflow: false,
    badInput: false,
    stepMismatch: false,
    typeMismatch: false,
    patternMismatch: false,
    ...validityOverrides,
  },
});

describe('getNativeValidationMessage', () => {
  it('returns an empty string when the field is valid', () => {
    expect(getNativeValidationMessage(t, target({ valid: true }))).toBe('');
  });

  it('reports a missing SELECT differently from a missing input', () => {
    expect(getNativeValidationMessage(t, target({ valueMissing: true }, { tagName: 'SELECT' }))).toBe(
      'validationSelectOption'
    );
    expect(getNativeValidationMessage(t, target({ valueMissing: true }))).toBe('pleaseFillThisField');
  });

  it('interpolates min/max length into the too-short/too-long messages', () => {
    expect(getNativeValidationMessage(t, target({ tooShort: true }, { minLength: 5 }))).toBe(
      'validationTooShort'
    );
    expect(getNativeValidationMessage(t, target({ tooLong: true }, { maxLength: 10 }))).toBe(
      'validationTooLong'
    );
  });

  it('interpolates min/max value into the range-underflow/overflow messages', () => {
    expect(getNativeValidationMessage(t, target({ rangeUnderflow: true }, { min: '1' }))).toBe(
      'validationMinValue'
    );
    expect(getNativeValidationMessage(t, target({ rangeOverflow: true }, { max: '99' }))).toBe(
      'validationMaxValue'
    );
  });

  it('treats badInput and stepMismatch as the same "bad number" message', () => {
    expect(getNativeValidationMessage(t, target({ badInput: true }))).toBe('validationBadNumber');
    expect(getNativeValidationMessage(t, target({ stepMismatch: true }))).toBe('validationBadNumber');
  });

  it('distinguishes email/date/generic typeMismatch', () => {
    expect(getNativeValidationMessage(t, target({ typeMismatch: true }, { type: 'email' }))).toBe(
      'validationInvalidEmail'
    );
    expect(getNativeValidationMessage(t, target({ typeMismatch: true }, { type: 'date' }))).toBe(
      'validationInvalidDate'
    );
    expect(getNativeValidationMessage(t, target({ typeMismatch: true }, { type: 'datetime-local' }))).toBe(
      'validationInvalidDate'
    );
    expect(getNativeValidationMessage(t, target({ typeMismatch: true }, { type: 'text' }))).toBe(
      'validationInvalidValue'
    );
  });

  it('reports a pattern mismatch', () => {
    expect(getNativeValidationMessage(t, target({ patternMismatch: true }))).toBe('validationPatternMismatch');
  });

  it('falls back to a generic message for an unrecognized invalid state', () => {
    expect(getNativeValidationMessage(t, target({}))).toBe('validationInvalidValue');
  });
});
