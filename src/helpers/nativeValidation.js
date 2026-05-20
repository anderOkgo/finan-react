const applyParams = (template, params) =>
  Object.entries(params).reduce((msg, [key, value]) => msg.replace(`{${key}}`, String(value)), template);

/** Maps HTML5 constraint validation to translated messages via t(). */
export const getNativeValidationMessage = (t, target) => {
  const { validity } = target;
  if (validity.valid) {
    return '';
  }

  if (validity.valueMissing) {
    if (target.tagName === 'SELECT') {
      return t('validationSelectOption');
    }
    return t('pleaseFillThisField');
  }

  if (validity.tooShort) {
    return applyParams(t('validationTooShort'), { min: target.minLength });
  }

  if (validity.tooLong) {
    return applyParams(t('validationTooLong'), { max: target.maxLength });
  }

  if (validity.rangeUnderflow) {
    return applyParams(t('validationMinValue'), { min: target.min });
  }

  if (validity.rangeOverflow) {
    return applyParams(t('validationMaxValue'), { max: target.max });
  }

  if (validity.badInput || validity.stepMismatch) {
    return t('validationBadNumber');
  }

  if (validity.typeMismatch) {
    if (target.type === 'email') {
      return t('validationInvalidEmail');
    }
    if (target.type === 'datetime-local' || target.type === 'date') {
      return t('validationInvalidDate');
    }
    return t('validationInvalidValue');
  }

  if (validity.patternMismatch) {
    return t('validationPatternMismatch');
  }

  return t('validationInvalidValue');
};

export const onNativeInvalid = (e, t) => {
  e.target.setCustomValidity(getNativeValidationMessage(t, e.target));
};

export const onNativeInput = (e) => {
  e.target.setCustomValidity('');
};
