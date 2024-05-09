import { createRequire } from 'module';
export const require = createRequire(import.meta.url);

const url = 'http://localhost:11434/api/generate';

export const prompt = async(prompt, context, model = 'llama3') => 
{
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "llama3",
            prompt: prompt,
            stream: true,
            // system: "You're a hard headed philosopher, determined to get to the bottom of the ultimate question. You are a pure materialist rationalist.",
            context: context,
            options: {
                temperature: 1.3,
                repeat_penalty: 1.5,
            }
        })
    });

    return response.body.getReader();
}

export const printResponse = async (reader) => {
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
            process.stdout.write(reply);

            if(response.done) {
                context = response.context;
            }
        }
    }

    return { finalString, context };
}