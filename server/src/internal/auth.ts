export function generateApiKey(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return `sk_${Buffer.from(bytes).toString("base64url")}`;
};

export function generateAccountId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return `acc_${Buffer.from(bytes).toString('base64url')}`;
};
