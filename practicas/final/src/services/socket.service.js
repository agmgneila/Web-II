let io;
export const setIo = (instance) => { io = instance; };
export const emitCompany = (companyId, event, data) => io?.to(String(companyId)).emit(event, data);
