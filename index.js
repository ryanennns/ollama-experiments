const { log } = require('node:console');
const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion() {
    console.log("\n")
    rl.question(`>>> `, async (answer) => {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({"model": "llama3",  "prompt": answer, "stream": true})
            });
            const reader = response.body.getReader();
            let done = false;

            let finalString = "";
            while (!done) {
                const { value, done: innerDone } = await reader.read();
                done = innerDone;
                if (value) {
                    const text = new TextDecoder().decode(value, { stream: true });
                    const response= JSON.parse(text).response;

                    finalString += JSON.parse(text).response
                    process.stdout.write(response);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
        askQuestion();
    });
}

askQuestion();
