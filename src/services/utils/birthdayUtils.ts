
export const checkClientBirthday = (birthDate: string) => {
  if (!birthDate) return false;
  const today = new Date();
  const birth = new Date(birthDate);
  return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
};
