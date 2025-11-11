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
#include <fstream>
#include <unordered_map>
#include <functional> // for hash
#include <sstream>

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
    string id, name, phone, address, password, upi_id;
    double balance;
};

vector<Account> users;
unordered_map<string, string> upi_hashes; // Encrypted UPI storage

// Simple hash function for UPI
string hashUPI(const string& upi) {
    hash<string> hasher;
    return to_string(hasher(upi));
}

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
    cout << "=== BMS V1 ACCESS UNLOCK ===\n";
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

// Save users to file
void saveUsers() {
    ofstream file("users.txt");
    if (file.is_open()) {
        for (const auto& acc : users) {
            file << acc.id << "," << acc.name << "," << acc.phone << "," << acc.address << "," << acc.password << "," << acc.balance << "," << acc.upi_id << "\n";
            upi_hashes[acc.id] = hashUPI(acc.upi_id);
        }
        file.close();
    }
}

// Load users from file
void loadUsers() {
    ifstream file("users.txt");
    if (file.is_open()) {
        string line;
        while (getline(file, line)) {
            stringstream ss(line);
            string token;
            Account acc;
            getline(ss, acc.id, ',');
            getline(ss, acc.name, ',');
            getline(ss, acc.phone, ',');
            getline(ss, acc.address, ',');
            getline(ss, acc.password, ',');
            getline(ss, token, ',');
            acc.balance = stod(token);
            getline(ss, acc.upi_id, ',');
            users.push_back(acc);
            upi_hashes[acc.id] = hashUPI(acc.upi_id);
        }
        file.close();
    }
}

// Display fake QR code with balance
void displayQR(const Account &acc) {
    srand(time(0));
    string upi = acc.upi_id;
    cout << "\n========== SIMULATED QR ==========\n";
    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 20; j++) {
            cout << ((rand() % 2) ? "##" : "  ");
        }
        cout << "\n";
    }
    cout << "Encoded: " << acc.name << "|" << acc.phone << "|" << acc.balance << "|" << upi << "\n";
    cout << "Balance: " << fixed << setprecision(2) << acc.balance << "\n";
    cout << "==================================\n";
}

// Show all users (admin view with masked ID)
void listUsersAdmin() {
    cout << "\nMasked ID\tName\tBalance\tPhone\tAddress\tEncrypted UPI\n";
    cout << "----------------------------------------------------\n";
    for (int i = 0; i < users.size(); i++) {
        string masked_id = users[i].id.substr(0, 4) + string(users[i].id.size() - 4, 'X');
        cout << masked_id << "\t" << users[i].name << "\t" << users[i].balance
             << "\t" << users[i].phone << "\t" << users[i].address << "\t" << upi_hashes[users[i].id] << "\n";
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
    cout << "UPI ID: ";
    getline(cin, a.upi_id);
    cout << "Password: ";
    getline(cin, a.password);
    cout << "Initial deposit: ";
    string dep;
    getline(cin, dep);
    a.balance = atof(dep.c_str());
    users.push_back(a);
    upi_hashes[a.id] = hashUPI(a.upi_id);
    saveUsers();
    cout << "\nAccount created successfully!\nYour ID: " << a.id << "\n";
    pauseScreen();
}

// Sign In with UID selection
Account* signIn() {
    clearConsole();
    cout << "=== SIGN IN ===\n";
    cout << "Available UIDs:\n";
    for (const auto& acc : users) {
        cout << "- " << acc.id << "\n";
    }
    string id, pass, phone, upi, name;
    cout << "ID: ";
    getline(cin, id);
    cout << "Name: ";
    getline(cin, name);
    cout << "Phone: ";
    getline(cin, phone);
    cout << "UPI ID: ";
    getline(cin, upi);
    cout << "Password: ";
    getline(cin, pass);

    for (int i = 0; i < users.size(); i++) {
        if (users[i].id == id && users[i].password == pass && users[i].name == name && users[i].phone == phone && users[i].upi_id == upi) {
            return &users[i];
        }
    }
    cout << "Invalid credentials!\n";
    pauseScreen();
    return NULL;
}

// Forgot Password
void forgotPassword() {
    clearConsole();
    cout << "=== FORGOT PASSWORD ===\n";
    string id, name, phone, upi;
    cout << "ID: ";
    getline(cin, id);
    cout << "Name: ";
    getline(cin, name);
    cout << "Phone: ";
    getline(cin, phone);
    cout << "UPI ID: ";
    getline(cin, upi);

    for (auto& acc : users) {
        if (acc.id == id && acc.name == name && acc.phone == phone && acc.upi_id == upi) {
            cout << "Admin verification required. Password reset to 'reset123'.\n";
            acc.password = "reset123";
            saveUsers();
            cout << "Password reset. Please contact admin for verification.\n";
            pauseScreen();
            return;
        }
    }
    cout << "Invalid details!\n";
    pauseScreen();
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
        saveUsers();
        cout << "Withdraw successful! New balance: " << acc.balance << "\n";
    }
}

// Admin add/subtract money
void adminModifyBalance() {
    clearConsole();
    cout << "=== ADMIN MODIFY BALANCE ===\n";
    cout << "Available UIDs:\n";
    for (const auto& acc : users) {
        cout << "- " << acc.id << "\n";
    }
    string id;
    cout << "Enter UID: ";
    getline(cin, id);
    for (auto& acc : users) {
        if (acc.id == id) {
            cout << "Current balance: " << acc.balance << "\n";
            cout << "Enter amount to add/subtract (negative for subtract): ";
            string amt;
            getline(cin, amt);
            double amount = atof(amt.c_str());
            acc.balance += amount;
            saveUsers();
            cout << "Balance updated to: " << acc.balance << "\n";
            pauseScreen();
            return;
        }
    }
    cout << "UID not found!\n";
    pauseScreen();
}

// Dashboard
void dashboard(Account &acc) {
    while (true) {
        clearConsole();
        cout << "=== DASHBOARD ===\n";
        cout << "Welcome, " << acc.name << " (" << acc.id << ")\n";
        cout << "Balance: " << acc.balance << "\n";
        cout << "Phone: " << acc.phone << "\n";
        cout << "UPI ID: " << acc.upi_id << "\n";
        cout << "1. Withdraw\n";
        cout << "2. Show UPI QR\n";
        cout << "3. Logout\n";
        cout << "Choose: ";
        string ch;
        getline(cin, ch);
        if (ch == "1") {
            withdraw(acc);
            pauseScreen();
        } else if (ch == "2") {
            displayQR(acc);
            pauseScreen();
        } else if (ch == "3") {
            break;
        }
    }
}

// Admin Dashboard
void adminDashboard() {
    while (true) {
        clearConsole();
        cout << "=== ADMIN DASHBOARD ===\n";
        cout << "1. List Users\n";
        cout << "2. Modify Balance\n";
        cout << "3. Logout\n";
        cout << "Choose: ";
        string ch;
        getline(cin, ch);
        if (ch == "1") {
            listUsersAdmin();
            pauseScreen();
        } else if (ch == "2") {
            adminModifyBalance();
        } else if (ch == "3") {
            break;
        }
    }
}

// Main program
int main() {
    srand(time(0));
    loadUsers();
    if (!snakeGameUnlock()) {
        cout << "\nAccess Denied!\n";
        return 0;
    }

    cout << "\nAccess Granted! Welcome to BMS V1!\n";
    this_thread::sleep_for(chrono::milliseconds(800));

    while (true) {
        clearConsole();
        cout << "=== BMS V1 ===\n";
        cout << "1. Sign Up\n";
        cout << "2. Sign In\n";
        cout << "3. Forgot Password\n";
        cout << "4. Admin Login\n";
        cout << "5. Exit\n";
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
            forgotPassword();
        } else if (ch == "4") {
            clearConsole();
            cout << "Admin Key: ";
            string key;
            getline(cin, key);
            if (key == "ADMIN") {
                cout << "Password: ";
                string pass;
                getline(cin, pass);
                if (pass == "12345678") {
                    adminDashboard();
                } else {
                    cout << "Invalid password!\n";
                    pauseScreen();
                }
            } else {
                cout << "Invalid key!\n";
                pauseScreen();
            }
        } else if (ch == "5") {
            break;
        }
    }

    cout << "\nThank you for using BMS V1!\n";
    return 0;
}
