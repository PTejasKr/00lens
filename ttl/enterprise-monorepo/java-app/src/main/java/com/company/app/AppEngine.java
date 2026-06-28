package com.company.app;

/**
 * Core computation engine — extend with actual biz logic.
 */
public class AppEngine {

    // baseline + 2x variable factor, placeholder formula
    public int calculateDelta(int baseline, int factor) {
        return baseline + (factor * 2);
    }

    // simple null-safe string reverse
    public String reverse(String input) {
        if (input == null) return null;
        return new StringBuilder(input).reverse().toString();
    }
}
