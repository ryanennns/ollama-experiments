import {exec} from 'child_process';
import {formatResponse, prompt, require} from './ollama.js';

const readline = require('node:readline');

let terminalSystemPrompt = `You are to always respond in the JSON format provided: ${JSON.stringify(responseFormat)}`
    + 'you will receive a prompt to do something on a Windows computer and you are to return the bare minimum terminal'
    + 'commands that you would use to complete the task as an array in the "terminal_commands" section.'
    + 'in the "response", include your line of thinking';

const interpretCommands = (response) => {
    const string = response.finalString.replaceAll("\\", "\\\\").replaceAll('\n', '');

    try {
        const terminalCommands = JSON.parse(string).terminal_commands;
        if (terminalCommands == null) {
            console.log('No terminal commands found');
            return null;
        }
        return terminalCommands;
    } catch (e) {
        console.log('Error parsing terminal commands', string);
        return null;
    }

}

async function executeTerminalCommands(terminalCommands, response) {
    console.log('Executing: ', terminalCommands.join(' && '))
    await exec(terminalCommands.join(' && '), async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            let newResponse = await prompt('Error executing terminal commands ' + error, response.context);
            await interpretAndExecuteTerminalCommands(newResponse);
            // const fixedResponse = await formatResponse(response)
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
}

async function interpretAndExecuteTerminalCommands(reader) {
    console.log('interpretAndExecuteTerminalCommands')
    const response = await formatResponse(reader);
    console.log(response.finalString)
    const terminalCommands = interpretCommands(response);

    if (!terminalCommands) {
        return response;
    }

    await executeTerminalCommands(terminalCommands, response);

    return response;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let context = [];

const askQuestion = () => {
    rl.question(`>>> `, async (answer) => {
        const reader = await prompt(answer, context);
        // const response = await printResponse(reader);
        const response = await interpretAndExecuteTerminalCommands(reader);

        context = response.context
        askQuestion();
    });
}

askQuestion();