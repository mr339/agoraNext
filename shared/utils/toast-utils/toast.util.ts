import { toast } from 'react-toastify';

export enum Types {
  info,
  success,
  error,
  warning,
}

export const showToast = (type: Types, message: string) => {
  toast.dismiss();
  const defaultValues = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: 'light',
  } as any;
  switch (type) {
    case Types.info:
      toast.info(message, defaultValues);
      break;
    case Types.error:
      toast.error(message, defaultValues);
      break;
    case Types.success:
      toast.success(message, defaultValues);
      break;
    default:
      toast(message, defaultValues);
  }
};
