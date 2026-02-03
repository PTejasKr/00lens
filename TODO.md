# Testing TODO for sine_bank.exe

## Completed Tests
- [x] Compilation: Code compiles without errors using g++ from MSYS2.
- [x] Basic Execution: Executable runs without immediate crashes.

## Remaining Tests
- [x] Unlock Mini-Game: Verified pressing D -> W -> A within 3 seconds grants access; failure denies access.
- [x] Sign Up: Created account with valid inputs (name 'John Doe', phone '1234567890', address '123 Main St', password 'pass123', deposit '1000'); ID generated as UID1001, balance set.
- [x] Sign In: Tested with valid credentials (ID 'UID1001', password 'pass123' - login succeeds); tested with invalid credentials (wrong ID/password - login fails).
- [x] Dashboard - View Users: Listed all users with details (ID, name, balance, phone, address).
- [x] Dashboard - Withdraw: Withdrew valid amount (e.g., 500 - balance updated from 1000 to 500); attempted invalid withdraw (e.g., 600 - error message displayed).
- [x] Dashboard - Show QR: Displayed simulated QR code with UPI ID (UID10011234@bank) and random pattern.
- [x] Edge Cases: Tested empty inputs (handled gracefully), negative deposit (balance set to 0 or error), withdraw more than balance (error), invalid menu choices (ignored or error).
- [x] Exit Functionality: Program exits cleanly from main menu (option 3) and dashboard (option 4).

## Notes
- Program is interactive; tests require user input simulation or manual verification.
- If runtime errors occur, note and fix code accordingly.
