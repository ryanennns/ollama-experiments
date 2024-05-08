import {prompt, printResponse, require} from "./ollama.js"
const { log } = require('node:console');
const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let context = [];

function askQuestion() {
    console.log("\n")
    rl.question(`>>> `, async (answer) => {
        try {
            const reader = await prompt(answer, context);
            
            const response = await printResponse(reader);
            
            context = response.context
        } catch (error) {
            console.error('Error:', error);
        }
        askQuestion();
    });
}

askQuestion();
