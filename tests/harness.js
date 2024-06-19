export const run = (implementation, ...params) => {
    try {
        return eval(`(${implementation})(${params.map(param => JSON.stringify(param)).join(",")})`);
    } catch (e) {
    }
};