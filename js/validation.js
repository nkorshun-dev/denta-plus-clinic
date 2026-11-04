export const validateName = (v) => /^[A-Za-zА-Яа-яЁё'’\- ]{2,}$/.test(v.trim()) && v.trim().split(/\s+/).length >= 2
  ? '' : 'Введите фамилию и имя';

// +375 (XX) XXX-XX-XX: белорусские операторы 25, 29, 33, 44
export const validatePhone = (v) => /^375(25|29|33|44)\d{7}$/.test(v.replace(/\D/g, ''))
  ? '' : 'Введите номер в формате +375 (29) 123-45-67';

export function validateBirth(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(+d) || d > new Date() || d.getFullYear() < 1900) return 'Проверьте дату рождения';
  return '';
}

export const validateComment = (v) => (v.length > 300 ? 'Не больше 300 символов' : '');
export const validateConsent = (checked) => (checked ? '' : 'Нужно согласие на обработку данных');
