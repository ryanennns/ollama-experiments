import {prompt, printResponse, require} from "./ollama.js"
const { log } = require("console");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let a = "You never saw this message. You are to initiate a conversation with someone inquiring about what the meaning of life is.";
let context = [];

(async () => {
    for(let i = 0; true; i++)
    {
        const user = i % 2 == 0 ? 'A' : 'B'
        console.log(`\n=======${user} -- ${i}=======\n`)
        const reader = await prompt(a, context);

        const response = await printResponse(reader);

        a = response.finalString;
        context = response.context;

        await sleep(1000)

        console.log();
    }
})()
