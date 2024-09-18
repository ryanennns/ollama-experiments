# `ollama-experiments`

This repository is a collection of experimental programs I've written that
make use of the ollama local API. These include:

1. `chat.js` - A recreation of the default ollama terminal chat interface.
2. `js-writer.js` - A program that iteratively prompts ollama for javascript code
that will pass a set of tests (see the `tests` directory). At present, this script
is functional, but somewhat buggy due to latency issues with ollama.
3. `self_prompt.js` - A program that allows ollama to prompt itself infinitely.
Currently set to discuss with itself the meaning of life.
4. `terminal.js` - A program that allows a user to prompt ollama with a desired
outcome as performed through a terminal. Ollama will then derive a series of linux
terminal commands and execute them, thereby (hopefully) achieving the desired outcome.