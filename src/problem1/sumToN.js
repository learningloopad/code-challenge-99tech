/**
 * Simple iterative loop
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * Mathematical formula
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
var sum_to_n_b = function(n) {
    return n * (n + 1) / 2;
};

/**
 * Recursive approach
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
var sum_to_n_c = function(n) {
    if (n === 1) {
        return 1;
    }
    return n + sum_to_n_c(n - 1);
};
