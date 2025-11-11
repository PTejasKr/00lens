# BMS V1 - Bank Management System

A console-based bank management system written in C++ with the following features:

## Features

- **Snake Game Unlock**: Press D -> W -> A in sequence within 3 seconds to unlock the system.
- **User Authentication**: Sign up and sign in with ID, name, phone, UPI ID, and password.
- **User Dashboard**: View account details, withdraw money, generate UPI QR code.
- **UPI QR Code**: Simulated QR code with account balance for UPI payments.
- **Admin Access**: Admin login with key "ADMIN" and password "12345678".
- **Admin Features**:
  - View all users with masked account numbers (first 4 digits shown, rest X).
  - Add/subtract money from user accounts.
- **Forgot Password**: Reset password to 'reset123' with admin verification.
- **File-Based Database**: Users stored in 'users.txt' file.
- **Encrypted UPI**: UPI IDs hashed for security.

## How to Run

1. Compile the code: `g++ "BMS V1.cpp" -o "BMS V1.exe" -std=c++11`
2. Run the executable: `./BMS V1.exe`

## Admin Credentials

- Key: ADMIN
- Password: 12345678

## File Structure

- `BMS V1.cpp`: Main source code
- `BMS V1.exe`: Compiled executable
- `users.txt`: User database (created automatically)
- `README.md`: This file

## Dependencies

- C++11 or higher
- Standard libraries: iostream, vector, string, fstream, etc.

## Notes

- This is a simulation; no real banking operations are performed.
- Data is stored locally in a text file.
- For production use, enhance security and use proper databases.
