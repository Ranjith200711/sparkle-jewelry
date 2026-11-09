export interface AddressValidationState {
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  landmark?: string;
  pincode: string;
}

export interface AddressValidationErrors {
  fullName?: string;
  phoneNumber?: string;
  addressLine?: string;
  pincode?: string;
  landmark?: string;
}

export function validateField(field: keyof AddressValidationState, value: string): string | undefined {
  const trimmed = value.trim();

  switch (field) {
    case 'fullName':
      if (!trimmed) return 'Full Name is required for doorstep delivery.';
      if (trimmed.length < 3) return 'Name must be at least 3 characters.';
      if (trimmed.length > 60) return 'Name cannot exceed 60 characters.';
      if (!/^[A-Za-z\s.'-]+$/.test(trimmed)) return 'Name should contain letters and spaces only.';
      if (['test', 'fake', 'asdf', 'admin', 'none', 'abc'].includes(trimmed.toLowerCase())) {
        return 'Please enter a genuine customer name.';
      }
      return undefined;

    case 'phoneNumber': {
      const digits = value.replace(/\D/g, '');
      if (!digits) return '10-digit mobile number is required for delivery OTP.';
      if (digits.length !== 10) return `Must be 10 digits (currently ${digits.length}).`;
      if (!/^[6-9]\d{9}$/.test(digits)) return 'Indian mobile numbers must start with 6, 7, 8, or 9.';
      if (/^(.)\1{9}$/.test(digits) || digits === '1234567890' || digits === '9876543210') {
        return 'Please enter an active, valid phone number.';
      }
      return undefined;
    }

    case 'addressLine': {
      if (!trimmed) return 'House/Flat No, Building, & Street address is required.';
      if (trimmed.length < 10) return `Address is too short (min 10 characters, currently ${trimmed.length}).`;
      const words = trimmed.split(/\s+/).filter(Boolean);
      if (words.length < 2) return 'Please include house/flat number and street name (at least 2 words).';
      if (/^[asdfghjklqwertyuiopzxcvbnm]+$/i.test(trimmed)) return 'Please enter a genuine street address.';
      return undefined;
    }

    case 'pincode': {
      const pinDigits = value.replace(/\D/g, '');
      if (!pinDigits) return '6-digit postal PIN code is required.';
      if (pinDigits.length !== 6) return `PIN must be exactly 6 digits (currently ${pinDigits.length}).`;
      if (!/^[1-8]\d{5}$/.test(pinDigits)) return 'Invalid Indian PIN code (must start with 1 to 8).';
      if (/^(.)\1{5}$/.test(pinDigits)) return 'Please enter a valid postal code.';
      return undefined;
    }

    case 'landmark':
      if (trimmed && trimmed.length < 3) return 'Landmark should be at least 3 characters if provided.';
      return undefined;

    default:
      return undefined;
  }
}

export function validateAllAddressFields(state: AddressValidationState): { isValid: boolean; errors: AddressValidationErrors } {
  const errors: AddressValidationErrors = {};

  const nameErr = validateField('fullName', state.fullName);
  if (nameErr) errors.fullName = nameErr;

  const phoneErr = validateField('phoneNumber', state.phoneNumber);
  if (phoneErr) errors.phoneNumber = phoneErr;

  const addrErr = validateField('addressLine', state.addressLine);
  if (addrErr) errors.addressLine = addrErr;

  const pinErr = validateField('pincode', state.pincode);
  if (pinErr) errors.pincode = pinErr;

  if (state.landmark) {
    const landErr = validateField('landmark', state.landmark);
    if (landErr) errors.landmark = landErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
