// import moment from "moment";
// import adbs from "ad-bs-converter";

export const errorParser = (err: any) => {
  if (err?.response?.data?.error) {
    return err?.response?.data?.error?.message;
  } else {
    return 'Something went wrong';
  }
};

export const numberWithCommas = (x: number | string | null) => {
  return x?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const maxCharacterValidation = (_: any, value: any) => {
  if (!value || value.length < 255) {
    return Promise.resolve();
  }
  if (value.length > 255) {
    return Promise.reject('The field must contain less than 255 characters.');
  }
  return Promise.resolve();
};

export const maxMinCharacterValidation = (_: any, value: any) => {
  if (!value || (value.length > 255 && value.length < 1000)) {
    return Promise.resolve();
  }
  return Promise.reject(
    `The fields must contain greater than 255 and less than 1000 characters.`
  );
};

export const capitalLetterValidation = (_: any, value: any) => {
  let isCapital = false;
  String(value)
    .split('')
    .forEach((char) => {
      if (char !== char.toLowerCase()) {
        isCapital = true;
      }
    });
  if (isCapital) {
    return Promise.reject('Email must be lowercase.');
  }
  return Promise.resolve();
};

export const phoneNumberValidation = (_: any, value: any) => {
  if (value && value?.toString()?.length < 7) {
    return Promise.reject('Phone number should be atleast 7 digits.');
  }
  if (value?.toString()?.length > 15) {
    return Promise.reject('Phone number should be less than 15 digits.');
  }
  return Promise.resolve();
};

export const mobileNumberValidation = (_: any, value: any) => {
  if (value && value?.toString()?.length < 10) {
    return Promise.reject('Mobile number should be atleast 10 digits.');
  }
  if (value?.toString()?.length > 15) {
    return Promise.reject('Mobile number should be less than 15 digits.');
  }
  return Promise.resolve();
};

export const phoneNumberPrevention = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
};

export const isObject = (obj: any) => {
  return obj != null && obj.constructor.name === 'Object';
};

// export const convertDateToBS = (date: moment.Moment) => {
//   let nepaliDate =
//     moment(date).isValid() && adbs.ad2bs(moment(date).format("YYYY/MM/DD"));
//   nepaliDate = `${nepaliDate?.en?.day}/${nepaliDate?.en?.month}/${nepaliDate?.en?.year}`;
//   return nepaliDate;
// };

export const changeBase64ToUrl = (base64Url: string) => {
  const contentType = 'image/png';
  const byteCharacters = atob(
    base64Url.substr(`data:${contentType};base64,`.length)
  );
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
};

export const truncateWord = (text: string, limit: number): string => {
  if (!text) return '';
  if (text.length >= limit) {
    return text.slice(0, limit) + '....';
  } else {
    return text;
  }
};

export const scrollToErrorField = (error: any) => {
  if (
    error?.errorFields &&
    error?.errorFields[0] &&
    error?.errorFields[0]?.name
  ) {
    const element: any = document.querySelector(
      `#${error?.errorFields[0]?.name.map((x: any) => x).join('_')}`
    );
    element && element.scrollIntoView({ block: 'center' });
    return;
  }
  if (error?.response?.data?.error?.errors) {
    const errors = error?.response?.data?.error?.errors;
    if (isObject(errors)) {
      const keyName = Object.keys(errors)[0];
      const element: any = keyName && document.querySelector(`#${keyName}`);
      element && element.scrollIntoView({ block: 'center' });
      return;
    }
  }
};

// export const handleFormError = (error: any, form: FormInstance<any>) => {
//   let errors = error?.response?.data?.error?.errors;
//   if (errors && isObject(errors)) {
//     Object.keys(errors)?.forEach((key) => {
//       form.setFields([
//         {
//           name: key,
//           errors: [errors[key].msg],
//         },
//       ]);
//     });
//     scrollToErrorField(error);
//   } else {
//     openErrorNotification(errorParser(error), "Error");
//   }
// };

export const parseCamelCaseWord = (camelCase: string) => {
  const result = camelCase.replace(/([A-Z])/g, ' $1');
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
};

export const characterTypingPrevention = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (
    !e.key.match(/^\d+/) &&
    e.key !== 'Backspace' &&
    e.key !== 'Tab' &&
    e.key !== 'ArrowLeft' &&
    e.key !== 'ArrowRight'
  ) {
    e.preventDefault();
  }
};
