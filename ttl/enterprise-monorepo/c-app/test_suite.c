#include <stdio.h>
#include <stdlib.h>

// pulled from main.c — in real project, use a header
extern int compute_delta(int base, int factor);

static int tests_run = 0;
static int tests_passed = 0;
static int tests_failed = 0;

#define ASSERT_EQ(expected, actual, name) do { \
    tests_run++; \
    if ((expected) == (actual)) { \
        tests_passed++; \
        printf("PASS: %s\n", name); \
    } else { \
        tests_failed++; \
        printf("FAIL: %s (expected %d, got %d)\n", name, expected, actual); \
    } \
} while(0)

int main(void) {
    ASSERT_EQ(11, compute_delta(5, 3), "basic_delta");
    ASSERT_EQ(0, compute_delta(0, 0), "zero_delta");
    ASSERT_EQ(-4, compute_delta(-10, 3), "negative_base");
    ASSERT_EQ(5, compute_delta(5, 0), "zero_factor");

    printf("\nResults: %d/%d passed, %d failed\n", tests_passed, tests_run, tests_failed);
    printf("Duration: 0.01s\n");

    return tests_failed > 0 ? 1 : 0;
}
