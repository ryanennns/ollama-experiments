import {prompt, printResponse, require} from "../utils/ollama.js"
const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let context = [];

const askQuestion = () => {
    console.log("\n")
    rl.question(`>>> `, async (answer) => {
        const reader = await prompt(answer, context);
        const response = await printResponse(reader);
        
        context = response.context
        askQuestion();
    });
}

askQuestion();
