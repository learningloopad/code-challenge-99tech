var normalize_positive_integer = function(n) {
    if (!Number.isFinite(n)) {
        return 0;
    }
    return Math.floor(n);
};

/**
 * Simple iterative loop
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
var sum_to_n_a = function(n) {
    const limit = normalize_positive_integer(n);
    if (limit <= 0) {
        return 0;
    }

    let sum = 0;
    for (let i = 1; i <= limit; i++) {
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
    const limit = normalize_positive_integer(n);
    if (limit <= 0) {
        return 0;
    }

    return limit * (limit + 1) / 2;
};

/**
 * Recursive approach
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
var sum_to_n_c = function(n) {
    const limit = normalize_positive_integer(n);
    if (limit <= 0) {
        return 0;
    }

    var recursive_sum = function(value) {
        if (value === 1) {
            return 1;
        }
        return value + recursive_sum(value - 1);
    };

    return recursive_sum(limit);
};
