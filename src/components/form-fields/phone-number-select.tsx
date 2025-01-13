import { Field } from 'formik';

interface PhoneNumberInputProps {
  name: string;
  dialCode?: string; // Made optional
  error?: string; // Just string now
}

export const PhoneNumberInput = ({ name, dialCode, error }: PhoneNumberInputProps) => {
  return (
    <div>
      <div
        className={`grid ${dialCode ? 'grid-cols-[80px_1fr]' : 'grid-cols-1'} overflow-hidden rounded-md border border-gray-300 bg-white`}
      >
        {dialCode && (
          <div className="flex items-center justify-center border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            {dialCode}
          </div>
        )}
        <Field
          type="tel"
          name={name}
          className="block w-full border-0 px-3 py-1.5 text-gray-900 ring-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
          placeholder="Phone number"
        />
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};
