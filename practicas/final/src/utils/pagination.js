export const pagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};
export const paged = (data, totalItems, page, limit) => ({
  data,
  pagination: { totalPages: Math.ceil(totalItems / limit), totalItems, currentPage: page, limit }
});
