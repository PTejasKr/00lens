# BHASAD Setup Instructions

## 1. Firebase Configuration
Ensure you have created a Firebase project and enabled:
- **Authentication**: Enable **Google Sign-In**.
- **Firestore Database**: Create the database in test mode or with appropriate rules.

## 2. Platform Configuration

### Android
Add the following permissions to your `android/app/src/main/AndroidManifest.xml` inside the `<manifest>` tag:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

Ensure your `minSdkVersion` in `android/app/build.gradle` is at least 21.

### Web (PWA)
No special configuration is needed for the code, but you must register your app in the Firebase Console and ensure the `google-signin-client_id` meta tag is present in `web/index.html` if required by the specific Google Sign-In method (though Firebase Auth usually handles this via the config).

**Important**: Make sure to add your authorized domains in the Firebase Console (Authentication -> Settings -> Authorized domains).

## 3. Google Sign-In (SHA-1)
For Android Google Sign-In to work, you must generate your SHA-1 fingerprint and add it to your Firebase Project Settings.

Run this command in your project root:
```bash
./gradlew signingReport
```
Copy the `SHA1` from the output and add it to Firebase.

## 4. Firestore Indexes
If you see errors regarding indexes in the console (e.g., when filtering rooms), follow the link provided in the error log to create the composite index.

Required Index likely needed for `rooms` collection:
- `expires_at` (Ascending/Descending)
- `is_active` (Ascending/Descending)

## 5. Running the App
```bash
flutter run
```
