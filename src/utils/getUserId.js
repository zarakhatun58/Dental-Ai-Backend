export const getUserId = ()=> {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  return user?.id || user?._id || null;
};