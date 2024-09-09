
# FoodGaurdian food waste management App

### Description

FoodGuardian is a user-friendly application designed to help you manage your food inventory efficiently. With FoodGuardian, you can easily record the items in your pantry, fridge, or freezer, and keep track of their expiration dates. The app sends timely reminders to use or donate items before they expire, reducing food waste and helping you contribute to your community.

One of the key features of FoodGuardian is its integration with local food banks. The app not only alerts you when food items are nearing their expiration dates but also provides information on nearby food banks where you can donate these items.

To encourage and motivate donations, FoodGuardian rewards users with points for every donation made, fostering a sense of community involvement while also promoting responsible food management.

### Table of Contents

### Built with
* [React Native](https://reactnative.dev/docs/getting-started) - Used for building the cross-platform mobile application, ensuring a smooth and consistent user experience on both iOS and Android devices.
* [Expo](https://docs.expo.dev/tutorial/introduction/) - Simplifies the development process by providing tools and services for building and deploying React Native apps quickly and efficiently.
* [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/) - Enables the app to access the device's camera for scanning food items, making it easier to add items to your inventory.
* [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) - Handles push notifications to remind users of upcoming food expiration and food waste reduction tips.
* [‎Gemini API](https://ai.google.dev/gemini-api/docs) - Utilized for scanning expiry dates, identifying raw and packaged items info, and generating tips on reducing food waste.
* [‎Open Food Facts API](https://world.openfoodfacts.org/files/api-documentation.html) - Takes barcodes and returns detailed product information from its comprehensive database, simplifying the process of adding items to your inventory.
* [‎Firebase](https://firebase.google.com/docs) - Manages real-time database storage,  inventory, and item categories. Ensuring organized and efficient tracking of all food items within the app.

### Requirements
* **Node.js**: Ensure you have Node.js installed on your machine. The recommended version is LTS (Long-Term Support).
* **npm** or **Yarn**: You need either npm (comes with Node.js) or Yarn installed for package management.
* **Expo CLI**: Install the Expo Command Line Interface globally on your machine:
  ```
  npm install -g expo-cli
  ```
  or
  ```
  yarn global add expo-cli
  ```
* **Android Studio** (for Android development):
  * Android SDK: Make sure you have the Android SDK installed.
  * Android Emulator: You can use an Android emulator to run your application, or use a physical Android device.

* **Xcode** (for iOS development):
  * Available only on macOS.
  * Install Xcode via the Mac App Store.
  * Make sure to set up an iOS Simulator or use a physical iOS device.
* **Expo Go App** (for testing on physical devices):
  * Available on both the [App Store](https://apps.apple.com/us/app/expo-go/id982107779) (iOS) and [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent&pcampaignid=web_share) (Android).
  * Allows you to run and test your Expo project on a real device without needing to build a full binary.
* **Git**: Version control system for cloning repositories and managing code changes.
* A code editor: Recommended editors include:
  * **Visual Studio Code**: A popular choice with rich support for JavaScript, React Native, and Expo development.
  * **Atom** or **Sublime Text**: Other options with good support for JavaScript and React Native.
### Install
1. Clone the repository:
```
git clone https://github.com/saralameri/FoodGaurdian
```
2. Navigate to the project directory:
```
cd FoodGuardian
```
3. Install the dependencies:
```
npm install
```
This command will install all the necessary packages listed in the `package.json` file.
### Usage Instructions
or detailed guidance on how to use the application, please refer to the [User Manual](./doc/FoodGaurdian_User_Manual.pdf) The manual provides step-by-step instructions on:
* Adding Food Items
* Updating Food Items
* Deleting Food Items
* Looking for Food Banks
* View Your Profile
* Creating Categories
* Updating Categories
* Deleting Categories
* Donations
Ensure you follow the instructions in the manual to make the most out of the application.
### Project Status
This project was developed as a side project and is now completed. There are no plans for future updates or maintenance. The repository will remain available for reference and use, but please note that it may not receive any further development or support.
### Team
* Sara Alameri - [GitHub Profile](https://github.com/saralameri)
* Helia Haghighi - [GitHub Profile](https://github.com/heli-ih)
