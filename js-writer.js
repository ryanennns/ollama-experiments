import {formatResponse, prompt} from "./ollama.js";
import * as test from "./tests/SearchInRotatedSortedArray.js";
import * as fs from "node:fs";

const responseFormat = {
    javascript: "",
    reasoning: "",
};

const maxAttempts = 3;
let attempts = 0;

async function promptLlmForCode(contextAndErrors) {
    let context = contextAndErrors.context ?? [];
    let error = contextAndErrors.error ?? "";
    let invalidJsonResponse = false;
    let script = "";
    let promptWithContext = test.default.prompt;
    let returnedPayload = "";

    do {
        console.log("LLM is generating code...");
        const reader = await prompt(
            promptWithContext + error,
            context,
            "You are responsible for writing a JavaScript function based on the prompt provided."
            + "You are to respond in the format provided: " + JSON.stringify(responseFormat) + ". "
            + "the function should be anonymous, and should not contain any console.log statements or \n characters."
            + "In the reasoning section, you should explain your reasoning for the code you have written and address"
            + "any changes you have made to fix errors that may have occurred in previous iterations."
        );

        console.log("Reading response...");
        const {responseContext, finalString} = await formatResponse(reader);
        returnedPayload = finalString;

        console.log("LLM completed generating code");
        console.log("Sanitizing response...");

        const string = finalString
            .replaceAll("\\n", "")
            .replaceAll("\n", "")
            .replaceAll("`", "")
            .replaceAll("\\", "");

        try {
            script = JSON.parse(string).javascript;
            invalidJsonResponse = false;
        } catch (e) {
            error = e;
            console.log("JSON parse error -- retrying");
            invalidJsonResponse = true;
        }
    } while (invalidJsonResponse);
    return {script, returnedPayload};
}

const generateCodeAndRunTests = async (contextAndErrors = []) => {
    const returnedPrompt = await promptLlmForCode(contextAndErrors);
    const script = returnedPrompt.script;

    let hasTestFailed = false;

    console.log("Running tests...");
    let testResults = [];
    test.default.tests.forEach(({test, expected, testCase}) => {
        process.stdout.write(`Running case: ${testCase}... `);
        let testPassed = true;
        const actual = test(script);

        if (String(actual) === String(expected)) {
            process.stdout.write("✓");
            console.log();
        } else {
            hasTestFailed = true;
            testPassed = false;
            process.stdout.write(`X`);
            console.log();
            console.log(`Expected: ${expected}, received: ${actual}`);
        }

        testResults.push({testCase, expected, actual, testPassed});
    });

    fs.appendFile("testResults.json", JSON.stringify({
        testResults,
        meta: returnedPrompt,
    }), (err) => {
        if (err) {
            console.error(err);
        }
    });

    if (hasTestFailed && attempts < maxAttempts) {
        console.log("Some tests have failed, retrying...");
        attempts++;
        await generateCodeAndRunTests({returnedContext, testResults});
    } else if (!hasTestFailed) {
        console.log("All tests passed!");
    }
};

await generateCodeAndRunTests();