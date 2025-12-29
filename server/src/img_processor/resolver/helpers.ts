export const is = {
    set: (v: any) => v !== -1,
    notSet: (v: any) => v === -1,
};

export const get = {
    ifSet: (v: any) => v !== -1 ? v : undefined,
};
