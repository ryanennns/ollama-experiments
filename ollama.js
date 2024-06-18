import {createRequire} from 'module';

export const require = createRequire(import.meta.url);

const url = 'http://localhost:11434/api/generate';
export const prompt = async (
    prompt,
    context,
    system = "",
) => {
    const responseFormat = {
        response: "",
        terminal_commands: [],
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            model: "llama3",
            prompt: prompt,
            stream: true,
            system: system,
            context: context,
            options: {
                temperature: 1.0,
                repeat_penalty: 0.9,
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
            const text = new TextDecoder().decode(value, {stream: true});
            const response = JSON.parse(text);
            const reply = response.response;

            finalString += reply
            process.stdout.write(reply);

            if (response.done) {
                context = response.context;
            }
        }
    }

    return {finalString, context};
}

export const formatResponse = async (reader) => {
    let done = false;
    let finalString = "";
    let context = [];

    while (!done) {
        const stream = await reader.read();
        const value = stream.value;
        done = stream.done;
        if (value) {
            const text = new TextDecoder().decode(value, {stream: true});
            const response = JSON.parse(text);
            const reply = response.response;

            finalString += reply

            if (response.done) {
                context = response.context;
            }
        }
    }

    return {finalString, context};
}