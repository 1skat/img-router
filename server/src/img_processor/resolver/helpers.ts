const set = (v: any) => v !== -1;
const notSet = (v: any) => v === -1;

const ifSet = (v: any) => v !== -1 ? v : undefined;

export const is = {
    set,
    notSet,
};

export const get = {
    ifSet,
};
