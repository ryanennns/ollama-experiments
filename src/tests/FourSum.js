import {run} from "./harness.js";

export default {
    prompt: "Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b]," +
        "nums[c], nums[d]] such that: 0 <= a, b, c, d < n a, b, c, and d are distinct. nums[a] + nums[b] + nums[c] +" +
        "nums[d] == target You may return the answer in any order.",
    tests: [
        {
            test: (f) => run(f, [1, 0, -1, 0, -2, 2], 0),
            expected: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]],
            testCase: "Example 1"
        },
        {
            test: (f) => run(f, [2, 2, 2, 2, 2], 8),
            expected: [[2, 2, 2, 2]],
            testCase: "All elements are the same"
        },
        {
            test: (f) => run(f, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 55),
            expected: [],
            testCase: "No quadruplets sum to 55"
        }
    ]
};