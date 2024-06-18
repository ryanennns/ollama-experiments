export const run = (implementation, ...params) => {
    return eval(`(${implementation})(${params.map(param => JSON.stringify(param)).join(",")})`);
};