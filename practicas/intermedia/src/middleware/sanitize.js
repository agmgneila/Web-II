const forbidden = new Set(['__proto__', 'constructor', 'prototype']);
const clean = (value) => {
  if (!value || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.') || forbidden.has(key)) delete value[key];
    else clean(value[key]);
  }
  return value;
};
export const sanitize = (req, _res, next) => {
  clean(req.body);
  clean(req.params);
  next();
};
