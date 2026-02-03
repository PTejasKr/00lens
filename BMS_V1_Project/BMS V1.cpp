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

// Wait for any key
void pauseScreen() {
    cout << "\nPress any key to continue...";
    getChar();
}

// Simple snake game unlock: eat 3 fruits to unlock
bool snakeGameUnlock() {
    clearConsole();
    cout << "=== BMS V1 ACCESS UNLOCK - SNAKE GAME ===\n";
    cout << "Snake moves forward always. Use A to turn left 90 degrees, D to turn right 90 degrees.\n";
    cout << "Eat 3 fruits to unlock. Avoid walls and yourself.\n";
    cout << "Press any key to start...\n";
    getChar();

    const int WIDTH = 20;
    const int HEIGHT = 10;
    vector<pair<int, int>> snake = {{WIDTH/2, HEIGHT/2}};
    pair<int, int> fruit = {rand() % (WIDTH - 2), rand() % (HEIGHT - 2)}; // 2x2 fruit
    int dirX = 1, dirY = 0; // Start moving right
    int score = 0;

    while (true) {
        clearConsole();
        cout << "Score: " << score << "/3\n";

        // Draw grid
        for (int y = 0; y < HEIGHT; y++) {
            for (int x = 0; x < WIDTH; x++) {
                bool isSnake = false;
                for (auto& p : snake) {
                    if (p.first == x && p.second == y) {
                        isSnake = true;
                        break;
                    }
                }
                bool isFruit = (x >= fruit.first && x < fruit.first + 2 && y >= fruit.second && y < fruit.second + 2);
                if (isSnake) {
                    cout << "<";
                } else if (isFruit) {
                    cout << "*";
                } else {
                    cout << ".";
                }
            }
            cout << "\n";
        }

        // Input
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
            // Turns: A left, D right
            if (ch == 'a' || ch == 'A') {
                // Turn left 90 degrees
                if (dirX == 1 && dirY == 0) { dirX = 0; dirY = -1; } // right -> up
                else if (dirX == 0 && dirY == -1) { dirX = -1; dirY = 0; } // up -> left
                else if (dirX == -1 && dirY == 0) { dirX = 0; dirY = 1; } // left -> down
                else if (dirX == 0 && dirY == 1) { dirX = 1; dirY = 0; } // down -> right
            } else if (ch == 'd' || ch == 'D') {
                // Turn right 90 degrees
                if (dirX == 1 && dirY == 0) { dirX = 0; dirY = 1; } // right -> down
                else if (dirX == 0 && dirY == 1) { dirX = -1; dirY = 0; } // down -> left
                else if (dirX == -1 && dirY == 0) { dirX = 0; dirY = -1; } // left -> up
                else if (dirX == 0 && dirY == -1) { dirX = 1; dirY = 0; } // up -> right
            }
        }

        // Move snake forward always
        pair<int, int> head = snake[0];
        head.first += dirX;
        head.second += dirY;

        // Check walls
        if (head.first < 0 || head.first >= WIDTH || head.second < 0 || head.second >= HEIGHT) {
            cout << "Hit wall! Game Over.\n";
            pauseScreen();
            return false;
        }

        // Check self collision
        for (auto& p : snake) {
            if (p.first == head.first && p.second == head.second) {
                cout << "Hit yourself! Game Over.\n";
                pauseScreen();
                return false;
            }
        }

        snake.insert(snake.begin(), head);

        // Check fruit (any part of 2x2)
        bool ateFruit = false;
        for (int fx = fruit.first; fx < fruit.first + 2; fx++) {
            for (int fy = fruit.second; fy < fruit.second + 2; fy++) {
                if (head.first == fx && head.second == fy) {
                    ateFruit = true;
                    break;
                }
            }
            if (ateFruit) break;
        }
        if (ateFruit) {
            score++;
            // Grow by 2 segments
            snake.insert(snake.begin(), head); // Already inserted one, add another
            // Spawn new fruit 10 units away, avoiding snake
            pair<int, int> newFruit;
            bool valid = false;
            while (!valid) {
                newFruit = {rand() % (WIDTH - 2), rand() % (HEIGHT - 2)};
                int dist = abs(newFruit.first - fruit.first) + abs(newFruit.second - fruit.second);
                if (dist >= 10) {
                    valid = true;
                    for (auto& p : snake) {
                        if (p.first >= newFruit.first && p.first < newFruit.first + 2 &&
                            p.second >= newFruit.second && p.second < newFruit.second + 2) {
                            valid = false;
                            break;
                        }
                    }
                }
            }
            fruit = newFruit;
            if (score >= 3) {
                cout << "Unlocked!\n";
                pauseScreen();
                return true;
            }
        } else {
            snake.pop_back();
        }

        this_thread::sleep_for(chrono::milliseconds(200));
    }
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
