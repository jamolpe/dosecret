const DB_ERROR_CODES_PERSONALIZATION = {
  11000: {
    message: 'Create secret failed duplicated key',
    code: 'CREATE_SECRET_11000',
    name: 'CREATE_SECRET_11000'
  }
};

export const manageDbCreateErrors = (error) => {
  const errorDef = DB_ERROR_CODES_PERSONALIZATION[error.code];
  return (
    errorDef || {
      message: 'Create secret failed',
      code: 'CREATE_SECRET_2022',
      name: 'CREATE_SECRET_2022'
    }
  );
};

export const ERROR_CODES = {
  NOT_REMOVED: {
    message: 'Secret not removed',
    code: 'REMOVE_SECRET_00001',
    name: 'REMOVE_SECRET_00001'
  },
  NOT_FOUND: {
    message: 'Secret not found',
    code: 'FOUND_SECRET_00001',
    name: 'FOUND_SECRET_00001'
  },
  EXPIRATION_DATE_ERROR: {
    message: 'Secret expiration date not valid',
    code: 'EXPIRATION_SECRET_00001',
    name: 'EXPIRATION_SECRET_00001'
  },
  SECRET_DATE_ERROR: {
    message: 'Secret date not valid',
    code: 'DATE_SECRET_00001',
    name: 'DATE_SECRET_00001'
  }
};
