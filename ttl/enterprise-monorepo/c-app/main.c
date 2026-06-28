#include <stdio.h>

// basic compute fn, swap this out for real logic
int compute_delta(int base, int factor) {
    return base + (factor * 2);
}

int main(void) {
    printf("delta(5,3) = %d\n", compute_delta(5, 3));
    return 0;
}
