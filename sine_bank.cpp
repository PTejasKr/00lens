#include <iostream>
#include <vector>
#include <string>
#include <cstdlib>
#include <ctime>
#include <thread>
#include <chrono>
#include <random>
#include <algorithm>
#include <iomanip>

#if defined(_WIN32)
#include <conio.h>
#include <windows.h>
#include <io.h>
#define access _access
#define F_OK 0
#else
#include <termios.h>
#include <unistd.h>
#include <sys/time.h>
#include <sys/select.h>
#include <fcntl.h>
#endif

using namespace std;

struct Account {
    string id, name, phone, address, password;
    double balance;
};

vector<Account> users;

// Simple ID generator
string generateId() {
    static int count = 1000;
    count++;
    return "UID" + to_string(count);
}

// Clear screen
void clearConsole() {
#if defined(_WIN32)
    system("cls");
#else
    system("clear");
#endif
}

// Read a single character (works on both systems)
char getChar() {
#if defined(_WIN32)
    return _getch();
#else
    char buf = 0;
    struct termios old = {0};
    tcgetattr(0, &old);
    old.c_lflag &= ~ICANON;
    old.c_lflag &= ~ECHO;
    tcsetattr(0, TCSANOW, &old);
    read(0, &buf, 1);
    old.c_lflag |= ICANON;
    old.c_lflag |= ECHO;
    tcsetattr(0, TCSADRAIN, &old);
    return buf;
#endif
}

// Simple unlock mini-game: press D -> W -> A in order within 3 seconds
bool snakeGameUnlock() {
    clearConsole();
    cout << "=== SINE BANK ACCESS UNLOCK ===\n";
    cout << "Press the keys in order: D -> W -> A (within 3 seconds)\n";

    time_t start = time(0);
    int stage = 0; // 0=d, 1=w, 2=a

    while (time(0) - start < 3) {
        char ch = 0;
#if defined(_WIN32)
        if (_kbhit()) ch = _getch();
#else
        fd_set set;
        struct timeval tv;
        FD_ZERO(&set);
        FD_SET(0, &set);
        tv.tv_sec = 0;
        tv.tv_usec = 100000;
        int rv = select(1, &set, NULL, NULL, &tv);
        if (rv > 0) read(0, &ch, 1);
#endif
        if (ch) {
            if ((ch == 'd' || ch == 'D') && stage == 0) stage = 1;
            else if ((ch == 'w' || ch == 'W') && stage == 1) stage = 2;
            else if ((ch == 'a' || ch == 'A') && stage == 2) return true;
        }
    }
    return false;
}

// Wait for any key
void pauseScreen() {
    cout << "\nPress any key to continue...";
    getChar();
}

// Display fake QR code
void displayQR(const Account &acc) {
    srand(time(0));
    string upi = acc.id + acc.phone.substr(acc.phone.size() - 4) + "@bank";
    cout << "\n========== SIMULATED QR ==========\n";
    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 20; j++) {
            cout << ((rand() % 2) ? "##" : "  ");
        }
        cout << "\n";
    }
    cout << "Encoded: " << acc.name << "|" << acc.phone << "|" << acc.balance << "|" << upi << "\n";
    cout << "==================================\n";
}

// Show all users
void listUsers() {
    cout << "\nID\tName\tBalance\tPhone\tAddress\n";
    cout << "----------------------------------------------------\n";
    for (int i = 0; i < users.size(); i++) {
        cout << users[i].id << "\t" << users[i].name << "\t" << users[i].balance
             << "\t" << users[i].phone << "\t" << users[i].address << "\n";
    }
}

// Sign Up
void signUp() {
    clearConsole();
    Account a;
    a.id = generateId();
    cout << "=== SIGN UP ===\n";
    cout << "Full name: ";
    getline(cin, a.name);
    cout << "Phone: ";
    getline(cin, a.phone);
    cout << "Address: ";
    getline(cin, a.address);
    cout << "Password: ";
    getline(cin, a.password);
    cout << "Initial deposit: ";
    string dep;
    getline(cin, dep);
    a.balance = atof(dep.c_str());
    users.push_back(a);
    cout << "\nAccount created successfully!\nYour ID: " << a.id << "\n";
    pauseScreen();
}

// Sign In
Account* signIn() {
    clearConsole();
    cout << "=== SIGN IN ===\n";
    string id, pass;
    cout << "ID: ";
    getline(cin, id);
    cout << "Password: ";
    getline(cin, pass);

    for (int i = 0; i < users.size(); i++) {
        if (users[i].id == id && users[i].password == pass) {
            return &users[i];
        }
    }
    cout << "Invalid ID or password!\n";
    pauseScreen();
    return NULL;
}
// Withdraw money
void withdraw(Account &acc) {
    cout << "Enter amount to withdraw: ";
    string amt;
    getline(cin, amt);
    double amount = atof(amt.c_str());
    if (amount <= 0 || amount > acc.balance) {
        cout << "Invalid amount!\n";
    } else {
        acc.balance -= amount;
        cout << "Withdraw successful! New balance: " << acc.balance << "\n";
    }
}

// Dashboard
void dashboard(Account &acc) {
    while (true) {
        clearConsole();
        cout << "=== DASHBOARD ===\n";
        cout << "Welcome, " << acc.name << " (" << acc.id << ")\n";
        cout << "Balance: " << acc.balance << "\n";
        cout << "1. View Users\n";
        cout << "2. Withdraw\n";
        cout << "3. Show QR\n";
        cout << "4. Logout\n";
        cout << "Choose: ";
        string ch;
        getline(cin, ch);
        if (ch == "1") {
            listUsers();
            pauseScreen();
        } else if (ch == "2") {
            withdraw(acc);
            pauseScreen();
        } else if (ch == "3") {
            displayQR(acc);
            pauseScreen();
        } else if (ch == "4") {
            break;
        }
    }
}

// Main program
int main() {
    srand(time(0));
    if (!snakeGameUnlock()) {
        cout << "\nAccess Denied!\n";
        return 0;
    }

    cout << "\nAccess Granted! Welcome to SINE Bank!\n";
    this_thread::sleep_for(chrono::milliseconds(800));

    while (true) {
        clearConsole();
        cout << "=== SINE BANK ===\n";
        cout << "1. Sign Up\n";
        cout << "2. Sign In\n";
        cout << "3. Exit\n";
        cout << "Choose: ";
        string ch;
        getline(cin, ch);

        if (ch == "1") {
            signUp();
        } else if (ch == "2") {
            Account* a = signIn();
            if (a != NULL) {
                dashboard(*a);
            }
        } else if (ch == "3") {
            break;
        }
    }

    cout << "\nThank you for using SINE Bank!\n";
    return 0;
}
