import {formatResponseForJsWriter, prompt} from "../utils/ollama.js";
import * as test from "./tests/SearchInRotatedSortedArray.js";
import * as fs from "node:fs";
import {ansi} from "../utils/ansi.js";

const responseFormat = {
    javascript: "() => {...some implementation...}",
    reasoning: "This is a string explaining the reasoning behind the code you've created.",
};

const maxAttempts = 3;
let attempts = 0;

const promptLlmForCode = async (contextAndErrors) => {
    let context = contextAndErrors.context ?? [];
    let error = contextAndErrors.error ?? "";
    let script = "";
    let reasoning = "";

    let invalidJsonResponse = false;
    do {
        console.log(ansi.blue, "LLM is generating code...");
        const reader = await prompt(
            test.default.prompt
            + "\nHere are the test case results from your previous code:"
            + JSON.stringify(contextAndErrors.testResults),
            context,
            "You are responsible for writing a JavaScript function based on the prompt provided."
            + "You are to respond in the format provided: " + JSON.stringify(responseFormat) + ". "
            + "the function should be anonymous, and should not contain any console.log statements or newline characters."
            + "In the reasoning section, you should write a brief 1-3 sentence reasoning for the code you have written and address"
            + "any changes you have made to fix errors that may have occurred in previous iterations."
        );

        console.log("Reading response...");
        const printResponseReturnValue = await formatResponseForJsWriter(reader);
        let llmJsonPayload = printResponseReturnValue.finalString;
        context = printResponseReturnValue.context;

        console.log("Sanitizing response...");

        llmJsonPayload = llmJsonPayload
            .replaceAll("\\n", "")
            .replaceAll("\n", "")
            .replaceAll("`", "")
            .replaceAll("\\", "");

        try {
            invalidJsonResponse = false;
            llmJsonPayload = JSON.parse(llmJsonPayload);

            script = llmJsonPayload.javascript;
            reasoning = llmJsonPayload.reasoning;
        } catch (e) {
            error = e;
            console.error(ansi.red, "JSON parse error -- retrying");
            invalidJsonResponse = true;
        }
    } while (invalidJsonResponse);

    return {script, reasoning, context};
};

const outputTestResultsToFile = (testResults, returnedPrompt) => {
    fs.appendFile("testResults.json", JSON.stringify({
        testResults,
        meta: {script: returnedPrompt.script, reasoning: returnedPrompt.reasoning},
    }), (err) => err);
};

const executeTest = (test, script, expected) => {
    const actual = test(script) ?? 'undefined';

    if (String(actual) === String(expected)) {
        console.log(ansi.green, "✓");

        return {actual, testPassed: true};
    } else {
        console.log(ansi.red, `X\tExpected: ${expected}, received: ${actual}`);

        return {actual, testPassed: false};
    }
};

const generateCodeAndRunTests = async (contextAndErrors = {}) => {
    const returnedPrompt = await promptLlmForCode(contextAndErrors);
    const script = returnedPrompt.script;

    let hasTestFailed = false;

    console.log(ansi.blue, "Running tests...");
    let testResults = [];
    test.default.tests.forEach(({test, expected, testCase}) => {
        console.log(ansi.blue, `Running case: ${testCase}... `);
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
        console.log(ansi.red, "Some tests have failed, retrying...");
        attempts++;
        await generateCodeAndRunTests({testResults, context: returnedPrompt.context});
    } else if (!hasTestFailed) {
        console.log(ansi.green, "All tests passed!");
        console.log("Explanation: " + returnedPrompt.reasoning);
    }
};

fs.writeFile("testResults.json", "", (err) => err);
await generateCodeAndRunTests();