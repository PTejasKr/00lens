CC = gcc
CFLAGS = -Wall -Wextra -Werror -std=c11

.PHONY: all clean test

all: main test_suite

main: main.c
	$(CC) $(CFLAGS) -o $@ $<

# link test_suite against main.o (minus main's main())
main_lib.o: main.c
	$(CC) $(CFLAGS) -c -o $@ $< -Dmain=__original_main

test_suite: test_suite.c main_lib.o
	$(CC) $(CFLAGS) -o $@ $^

test: test_suite
	./test_suite | tee test-results.txt

clean:
	rm -f main test_suite main_lib.o test-results.txt
