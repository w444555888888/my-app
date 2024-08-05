export const errorMessage = (status, message, error = null) => {
    const err = new Error(message);
    err.status = status;
    if (error) err.details = error;
    return err;
  };
  