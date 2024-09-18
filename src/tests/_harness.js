import {ansi} from "../../utils/ansi.js";

export const run = (implementation, ...params) => {
    try {
        return eval(`(${implementation})(${params.map(param => JSON.stringify(param)).join(",")})`);
    } catch (e) {
        console.log(ansi.red, "Error occurred during test execution");
        console.error(e);
    }
};