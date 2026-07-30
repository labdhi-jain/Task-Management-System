import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Alert = ({ type = 'error', message }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      className={`alert ${isError ? 'alert-error' : 'alert-success'} animate-fade-in`}
      role="alert"
    >
      {isError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
      <span>{message}</span>
    </div>
  );
};

export default Alert;
