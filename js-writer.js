import {formatResponse, prompt} from "./ollama.js";
import * as test from "./tests/TwoSum.js";

const responseFormat = {
    javascript: "",
};

let invalidJsonResponse = false;
let script = "";
do {
    const reader = await prompt(
        test.default.prompt,
        [],
        "You are responsible for writing a JavaScript function based on the prompt provided." +
        "You are to respond in the format provided: " + JSON.stringify(responseFormat) + ". "
        + "the function should be anonymous, and should not contain any console.log statements or \n characters"
    );

    const {context, finalString} = await formatResponse(reader);

    console.log("LLM completed generating code...");

    const string = finalString
        .replaceAll("\\n", "")
        .replaceAll("\\", "");

    try {
        script = JSON.parse(string).javascript;
        invalidJsonResponse = false;
    } catch (e) {
        console.log("Error parsing JSON, retrying...");
        invalidJsonResponse = true;
    }
} while (invalidJsonResponse);

console.log("Running tests...");
let hasTestFailed = false;
test.default.tests.forEach(({test, expected, testCase}) => {
    process.stdout.write(`${testCase}... `);
    const actual = test(script);

    if (String(actual) === String(expected)) {
        process.stdout.write("✓");
        console.log();
    } else {
        hasTestFailed = true;
        process.stdout.write(`X`);
        console.log(`\nExpected: ${expected}\nReceived: ${actual}`);
    }

});

if (hasTestFailed) {
    console.log(script);
}
