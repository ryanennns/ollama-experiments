const { log } = require("console");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const prompt = async(prompt, context) => 
{
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "llama3", 
            prompt: prompt,
            stream: true,
            system: "You're a hard headed philosopher, determined to get to the bottom of the ultimate question..",
            context: context,
            options: {
                // temperature: 1.3,
                // repeat_penalty: 1.5,
            }
        })
    });

    return response.body.getReader();
}

const printResponse = async (reader) => {
    let done = false;
    let finalString = "";
    let context = [];

    while (!done) {
        const stream = await reader.read();
        const value = stream.value;
        done = stream.done;
        if (value) {
            const text = new TextDecoder().decode(value, { stream: true });
            const response = JSON.parse(text);
            const reply = response.response;

            finalString += reply
            // process.stdout.write(reply);

            if(response.done) {
                context = response.context;
            }
        }
    }

    return { finalString, context};
}

let a = "You never saw this message. You are to initiate a conversation with a stranger about the meaning of life, and engage with them about what it might be.";
let context = [];

(async () => {
    for(i = 0; true; i++)
    {
        const user = i % 2 == 0 ? 'a' : 'b'
        console.log(`\n=======${user} -- ${i}=======\n`)
        const reader = await prompt(a, context);

        const response = await printResponse(reader);

        a = response.finalString;
        context = response.context;

        await sleep(1000)

        console.log();
    }
})()
