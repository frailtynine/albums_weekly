import React from 'react';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/ru'

interface ReusableDateTimePickerProps {
  label: string;
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
}

const CustomDateTimePicker: React.FC<ReusableDateTimePickerProps> = ({ label, value, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ru'>
      <DateTimePicker
        label={label}
        value={value}
        onChange={onChange}
      />
    </LocalizationProvider>
  );
};

export default CustomDateTimePicker;