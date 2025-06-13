export const logout = () => {
  document.cookie = "JWT_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};


export default logout;