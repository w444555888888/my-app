export const sendResponse = (res, status, data = {}, message = "") => {
  return res.status(status).json({
    success: true,
    data: data,
    message: message,
  });
};

  