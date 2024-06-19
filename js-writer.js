import {formatResponse, printResponse, prompt} from "./ollama.js";
import * as test from "./tests/SearchInRotatedSortedArray.js";
import * as fs from "node:fs";

const responseFormat = {
    javascript: "",
    // reasoning: "",
};

const maxAttempts = 3;
let attempts = 0;

const promptLlmForCode = async (contextAndErrors) => {
    let context = contextAndErrors.context ?? [];
    let error = contextAndErrors.error ?? "";
    let script = "";

    let invalidJsonResponse = false;
    do {
        console.log("LLM is generating code...");
        const reader = await prompt(
            test.default.prompt
            + "\nHere are the test case results from your previous code:"
            + JSON.stringify(contextAndErrors.testResults),
            context,
            "You are responsible for writing a JavaScript function based on the prompt provided."
            + "You are to respond in the format provided: " + JSON.stringify(responseFormat) + ". "
            + "the function should be anonymous, and should not contain any console.log statements or \n characters."
            // + "In the reasoning section, you should write a brief 1-3 sentence reasoning for the code you have written and address"
            // + "any changes you have made to fix errors that may have occurred in previous iterations."
        );

        console.log("Reading response...");
        const printResponseReturnValue = await formatResponse(reader);
        let llmJsonPayload = printResponseReturnValue.finalString;
        context = printResponseReturnValue.context;

        console.log("Sanitizing response...");

        llmJsonPayload = llmJsonPayload
            .replaceAll("\\n", "")
            .replaceAll("\n", "")
            .replaceAll("`", "")
            .replaceAll("\\", "");

        try {
            script = JSON.parse(llmJsonPayload).javascript;
            invalidJsonResponse = false;
        } catch (e) {
            error = e;
            console.log("JSON parse error -- retrying");
            invalidJsonResponse = true;
        }
    } while (invalidJsonResponse);

    return {script, context};
};

const outputTestResultsToFile = (testResults, returnedPrompt) => {
    fs.appendFile("testResults.json", JSON.stringify({
        testResults,
        meta: returnedPrompt,
    }), (err) => err);
};

const executeTest = (test, script, expected) => {
    const actual = test(script);

    if (String(actual) === String(expected)) {
        process.stdout.write("✓");
        console.log();

        return {actual, testPassed: true};
    } else {
        process.stdout.write(`X`);
        console.log();
        console.log(`Expected: ${expected}, received: ${actual}`);

        return {actual, testPassed: false};
    }
};

const generateCodeAndRunTests = async (contextAndErrors = {}) => {
    const returnedPrompt = await promptLlmForCode(contextAndErrors);
    const script = returnedPrompt.script;

    let hasTestFailed = false;

    console.log("Running tests...");
    let testResults = [];
    test.default.tests.forEach(({test, expected, testCase}) => {
        process.stdout.write(`Running case: ${testCase}... `);
        const testFeedback = executeTest(test, script, expected);

        hasTestFailed = !testFeedback.testPassed;
        testResults.push({
            testCase,
            expected,
            actual: testFeedback.actual,
            testPassed: testFeedback.testPassed
        });
    });

    outputTestResultsToFile(testResults, returnedPrompt);

    if (hasTestFailed && attempts < maxAttempts) {
        console.log("Some tests have failed, retrying...");
        attempts++;
        await generateCodeAndRunTests({testResults, context: returnedPrompt.context});
    } else if (!hasTestFailed) {
        console.log("All tests passed!");
    }
};

await generateCodeAndRunTests();