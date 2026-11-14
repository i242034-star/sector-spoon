// Form validation for the checkout page (FR10).
// Returns an object of { fieldName: message } for every invalid field.

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,39}$/;
// Pakistani mobile: 03XX followed by 7 digits, optional dash (e.g. 0312-3456789)
const PHONE_PATTERN = /^03\d{2}-?\d{7}$/;

export const NOTES_MAX = 200;

export function validateCheckout(form, method) {
  const errors = {};
  const name = form.name.trim();

  if (!name) errors.name = 'Enter the name we should call out at handover.';
  else if (!NAME_PATTERN.test(name)) errors.name = 'Use 2-40 letters (spaces, dots and hyphens allowed).';

  if (!form.phone.trim()) errors.phone = 'Enter a mobile number so the rider can reach you.';
  else if (!PHONE_PATTERN.test(form.phone.trim()))
    errors.phone = 'Use the format 03XX-XXXXXXX (11 digits starting with 03).';

  if (method === 'delivery') {
    if (!form.zoneId) errors.zoneId = 'Choose the sector you are in.';
    if (form.address.trim().length < 10)
      errors.address = 'Add house/hostel and street (at least 10 characters) so the rider can find you.';
  } else if (!form.slot) {
    errors.slot = 'Choose a pickup time.';
  }

  if (form.notes.length > NOTES_MAX) errors.notes = `Keep notes under ${NOTES_MAX} characters (${form.notes.length} now).`;

  return errors;
}
