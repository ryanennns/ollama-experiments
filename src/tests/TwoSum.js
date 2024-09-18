import {run} from "./_harness.js";

export default {
    prompt: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    tests: [
        {
            test: (f) => run(f, [2, 7, 11, 15], 9),
            expected: [0, 1],
            testCase: "2 + 7 = 9"
        },
        {
            test: (f) => run(f, [3, 2, 4], 6),
            expected: [1, 2],
            testCase: "2 + 4 = 6"
        },
        {
            test: (f) => run(f, [3, 3], 6),
            expected: [0, 1],
            testCase: "3 + 3 = 6"
        }
    ]
};