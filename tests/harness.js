export const run = (implementation, ...params) => {
    try {
        return eval(`(${implementation})(${params.map(param => JSON.stringify(param)).join(",")})`);
    } catch (e) {
        // console.log("Error executing function");
        // console.log(implementation);
    }
};