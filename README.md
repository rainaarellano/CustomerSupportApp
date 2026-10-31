\# Customer Support Form with Cloudinary and EmailJS



\## Project Description



The Customer Support Form is a mobile application developed using React Native and Expo. It allows users to report problems by submitting their name, email address, issue category, and message. Users can also select a screenshot from their device gallery and upload it to Cloudinary.



After successfully uploading the screenshot, the application uses EmailJS to send the customer's support details and clickable screenshot link to the recipient's email address.



\## Project Objectives



\- To allow users to select images from their device gallery using Expo Image Picker.

\- To upload selected screenshots to Cloudinary.

\- To retrieve the public image URL from Cloudinary.

\- To send customer support messages using EmailJS.

\- To use environment variables for application configuration.

\- To practice Git and GitHub collaboration.



\## Features



\- Customer name input

\- Email address input

\- Issue category selection

\- Message input

\- Screenshot selection from the gallery

\- Selected image preview

\- Image removal or replacement

\- Cloudinary image upload

\- EmailJS support email delivery

\- Clickable screenshot link in the received email

\- Form validation

\- Loading indicator during submission

\- Success and error messages

\- Duplicate submission prevention



\## Technologies Used



\- React Native

\- Expo

\- JavaScript

\- Expo Image Picker

\- Cloudinary

\- EmailJS

\- Git

\- GitHub

\- Visual Studio Code



\## Installation Instructions



1\. Clone the repository:



&#x20;  `git clone https://github.com/rainaarellano/CustomerSupportApp.git`



2\. Open the project folder:



&#x20;  `cd CustomerSupportApp`



3\. Install dependencies:



&#x20;  `npm install`



4\. Install Expo Image Picker if it is not already included:



&#x20;  `npx expo install expo-image-picker`



5\. Create a `.env` file in the project root directory.



6\. Add the required environment variables using your own configuration values.



7\. Start the application:



&#x20;  `npx expo start`



8\. Press `w` to open the web version or scan the QR code using Expo Go.



\## Environment Variables



Create a local `.env` file with the following variable names:



\- `EXPO\_PUBLIC\_CLOUDINARY\_CLOUD\_NAME`

\- `EXPO\_PUBLIC\_CLOUDINARY\_UPLOAD\_PRESET`

\- `EXPO\_PUBLIC\_EMAILJS\_SERVICE\_ID`

\- `EXPO\_PUBLIC\_EMAILJS\_TEMPLATE\_ID`

\- `EXPO\_PUBLIC\_EMAILJS\_PUBLIC\_KEY`



Do not upload the actual `.env` file to GitHub. Use `.env.example` as a reference for the required configuration.



\## GitHub Repository



https://github.com/rainaarellano/CustomerSupportApp



\## Project Members



1\. Sitti Raina Arellano

2\. Dimple Joy Glemao



\## Security



The actual `.env` file is excluded from GitHub using `.gitignore`. Never include private credentials, passwords, or Cloudinary API secrets in the source code or public repository.



\## Project Status



The Customer Support Form application has been developed and tested using Expo, Cloudinary, and EmailJS.

