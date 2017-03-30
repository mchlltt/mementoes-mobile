# Mementoes (mobile)
Inspired by the idea of a [Happiness Jar](https://www.elizabethgilbert.com/lets-talk-about-those-happiness-jars-shall-we-dear-lovelies-about-a-y/), Mementoes asks you to make a note of one thing that made you happy each day. This exercise allows you to connect with the good things in your life as they happen and to reflect back upon them over time.

This repository hosts a React Native sister application to the Mementoes web application ([GitHub](https://github.com/mchlltt/mementoes), [Heroku](https://mementoes.herokuapp.com/)). Currently supports Android phones.

## Demo
![App demo GIF](https://github.com/mchlltt/mementoes-mobile/raw/master/demo_gif.gif)

## Features
The demo above walks through the main features of the application.
- Authentication with Google OAuth 2.0.
- Synchronized data across web app and mobile app.
- View, create, update, or delete entries.
- Set a daily reminder notification.
- Log out to clear user data and scheduled notifications.

_'Export Data' and 'Delete Account' in Settings direct the user to launch the web application, as these features are not yet available on the Android app._

## Installation
- Find the most recent release in the [Releases](https://github.com/mchlltt/mementoes-mobile/releases/) tab.
- Download the APK to your Android device.
- Ensure that `Allow installation of apps from unknown sources` is enabled in the Security settings of your device.
- Open and install the APK.

## Built with
- React Native
- React Native Modules/Components
   - [React Navigation](https://github.com/react-community/react-navigation)
   - [React Native Simple Auth](https://github.com/adamjmcgrath/react-native-simple-auth)
   - [React Native Push Notification](https://github.com/zo0r/react-native-push-notification)
   - [React Native Calendar](https://github.com/christopherdro/react-native-calendar)
   - [React Native Settings List](https://github.com/evetstech/react-native-settings-list)
- MomentJS
- WebStorm and Android Studio

## Authors
- Mich Elliott - [mchlltt](https://github.com/mchlltt)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Acknowledgements
The author of this project would like to thank Northwestern University Coding Boot Camp for direction and support in creating this product, as well as the vibrant community of React Native users for sharing their work and wisdom.

Additionally, the jar used in the application logo was used with permission from <a href="http://www.freepik.com/free-photos-vectors/background">Freepik</a>.
