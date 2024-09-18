import {run} from "./_harness.js";

export default {
    prompt: "You are to write a function that takes in an array of numbers and returns the sum of the numbers in the array.",
    tests: [
        {
            test: (f) => run(f, [1, 2, 3], 3),
            expected: 6,
            testCase: "1+2+3 sums to 6"
        },
        {
            test: (f) => run(f, [1, 2, 3, 4, 5]),
            expected: 15,
            testCase: "1+2+3+4+5 sums to 15"
        },
        {
            test: (f) => run(f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
            expected: 55,
            testCase: "1+2+3+4+5+6+7+8+9+10 sums to 55"
        }
    ]
};