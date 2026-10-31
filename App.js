
import React, { useState, useRef } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

// Cloudinary configuration
const CLOUDINARY_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// EmailJS configuration
const EMAILJS_SERVICE_ID =
  process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;

const EMAILJS_TEMPLATE_ID =
  process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;

const EMAILJS_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

// Maximum characters for the concern message
const MAX_MESSAGE_LENGTH = 500;

const CATEGORIES = [
  { label: 'Technical Issue', icon: '⚙️' },
  { label: 'Account Problem', icon: '👤' },
  { label: 'Payment Issue', icon: '💳' },
  { label: 'Other', icon: '💬' },
];

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const submitting = useRef(false);

  // Display messages on web and mobile
  const showMessage = (title, messageText) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${messageText}`);
    } else {
      Alert.alert(title, messageText);
    }
  };

  // Select an image from the gallery
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showMessage(
          'Permission Required',
          'Please allow access to your photo gallery.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      showMessage(
        'Image Error',
        'Unable to open your gallery.'
      );
    }
  };

  // Upload screenshot to Cloudinary
  const uploadToCloudinary = async () => {
    if (!CLOUDINARY_NAME || !CLOUDINARY_PRESET) {
      throw new Error(
        'Check your Cloudinary settings in the .env file.'
      );
    }

    if (!image) {
      throw new Error('Please attach a screenshot.');
    }

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(image.uri);

      if (!response.ok) {
        throw new Error('Unable to read the selected image.');
      }

      const blob = await response.blob();

      formData.append(
        'file',
        blob,
        'support-screenshot.jpg'
      );
    } else {
      formData.append('file', {
        uri: image.uri,
        name: image.fileName || 'support-screenshot.jpg',
        type: image.mimeType || 'image/jpeg',
      });
    }

    formData.append('upload_preset', CLOUDINARY_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.secure_url) {
      throw new Error(
        result.error?.message || 'Cloudinary upload failed.'
      );
    }

    return result.secure_url;
  };

  // Send support request through EmailJS
  const sendEmail = async (imageUrl) => {
    if (
      !EMAILJS_SERVICE_ID ||
      !EMAILJS_TEMPLATE_ID ||
      !EMAILJS_PUBLIC_KEY
    ) {
      throw new Error(
        'Check your EmailJS settings in the .env file.'
      );
    }

    const emailData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        name: name.trim(),
        reply_to: email.trim(),
        issue_category: category,
        message: message.trim(),
        image_url: imageUrl,
      },
    };

    const response = await fetch(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        errorText || 'Email sending failed.'
      );
    }
  };

  // Validate and submit the support form
  const handleSubmit = async () => {
    if (submitting.current) return;

    if (
      !name.trim() ||
      !email.trim() ||
      !category ||
      !message.trim()
    ) {
      showMessage(
        'Incomplete Form',
        'Please complete all required fields.'
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      showMessage(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    if (!image) {
      showMessage(
        'Screenshot Required',
        'Please attach a screenshot before submitting.'
      );
      return;
    }

    try {
      submitting.current = true;
      setLoading(true);
      setStatusText('Uploading your screenshot...');

      // Upload screenshot first
      const imageUrl = await uploadToCloudinary();

      // Send email only after successful upload
      setStatusText('Sending your support request...');

      await sendEmail(imageUrl);

      showMessage(
        'Request Sent Successfully!',
        'Thank you! Your customer support request has been sent.'
      );

      // Clear form after successful submission
      setName('');
      setEmail('');
      setCategory('');
      setMessage('');
      setImage(null);
    } catch (error) {
      showMessage(
        'Submission Failed',
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      submitting.current = false;
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F7FC"
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topHeader}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>

          <Text style={styles.headerTag}>CUSTOMER CARE</Text>
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>
            We're here to help.
          </Text>

          <Text style={styles.subtitle}>
            Tell us what happened. Our support team is ready to assist you.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💙</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Need assistance?
            </Text>

            <Text style={styles.infoText}>
              Complete the form below and send us your concern.
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>
              Support Request
            </Text>

            <Text style={styles.requiredText}>
              * Required fields
            </Text>
          </View>

          <Text style={styles.label}>Full Name *</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#98A2B3"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <Text style={styles.label}>Email Address *</Text>

          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor="#98A2B3"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Text style={styles.label}>Issue Category *</Text>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((item) => {
              const selected = category === item.label;

              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryButton,
                    selected && styles.categorySelected,
                  ]}
                  onPress={() => setCategory(item.label)}
                  disabled={loading}
                >
                  <Text style={styles.categoryIcon}>
                    {item.icon}
                  </Text>

                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.categoryTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>

                  {selected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>
            Describe Your Concern *
          </Text>

          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Please explain your concern in detail..."
            placeholderTextColor="#98A2B3"
            multiline
            textAlignVertical="top"
            maxLength={MAX_MESSAGE_LENGTH}
            value={message}
            onChangeText={setMessage}
            editable={!loading}
          />

          {/* Partner contribution: message character counter */}
          <Text
            style={[
              styles.characterCount,
              message.length >= MAX_MESSAGE_LENGTH &&
                styles.characterLimitReached,
            ]}
          >
            {message.length}/{MAX_MESSAGE_LENGTH} characters
          </Text>

          <View style={styles.uploadHeading}>
            <Text style={styles.label}>
              Attach Screenshot *
            </Text>

            <Text style={styles.optionalText}>Required</Text>
          </View>

          <TouchableOpacity
            style={styles.uploadBox}
            activeOpacity={0.8}
            onPress={pickImage}
            disabled={loading}
          >
            <View style={styles.uploadIconCircle}>
              <Text style={styles.uploadIcon}>↑</Text>
            </View>

            <Text style={styles.uploadTitle}>
              Choose Image from Gallery
            </Text>

            <Text style={styles.uploadDescription}>
              Select a screenshot that shows your issue
            </Text>
          </TouchableOpacity>

          {image && (
            <View style={styles.previewCard}>
              <Image
                source={{ uri: image.uri }}
                style={styles.preview}
              />

              <View style={styles.previewDetails}>
                <Text style={styles.previewTitle}>
                  Screenshot attached
                </Text>

                <Text style={styles.previewSubtitle}>
                  Ready to upload
                </Text>

                <TouchableOpacity
                  onPress={() => setImage(null)}
                  disabled={loading}
                >
                  <Text style={styles.removeText}>
                    Remove image
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" />

                <Text style={styles.submitText}>
                  {statusText || 'Please wait...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>
                Submit Support Request →
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.privacyText}>
            🔒 Your information will be used only to respond to your concern.
          </Text>
        </View>

        <Text style={styles.footer}>
          CUSTOMER SUPPORT • WE'RE HERE FOR YOU
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 35,
    alignItems: 'center',
  },

  topHeader: {
    width: '100%',
    maxWidth: 680,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#246BCE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoIcon: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
  },

  headerTag: {
    color: '#246BCE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },

  heading: {
    width: '100%',
    maxWidth: 680,
    marginBottom: 22,
  },

  title: {
    color: '#173B68',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  subtitle: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 9,
  },

  infoCard: {
    width: '100%',
    maxWidth: 680,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1FF',
    borderRadius: 14,
    padding: 17,
    marginBottom: 22,
    gap: 13,
  },

  infoIcon: {
    fontSize: 27,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#173B68',
    fontWeight: 'bold',
    fontSize: 15,
  },

  infoText: {
    color: '#526B8A',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },

  formCard: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7ECF3',
    shadowColor: '#173B68',
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },

  sectionTitle: {
    color: '#173B68',
    fontSize: 21,
    fontWeight: '800',
  },

  requiredText: {
    color: '#98A2B3',
    fontSize: 11,
  },

  label: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 9,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DCE3ED',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#172B4D',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },

  messageInput: {
    minHeight: 125,
    paddingTop: 14,
  },

  // Partner contribution: character counter styling
  characterCount: {
    color: '#98A2B3',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
  },

  characterLimitReached: {
    color: '#D92D20',
    fontWeight: '700',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  categoryButton: {
    width: '48%',
    flexGrow: 1,
    minHeight: 58,
    padding: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#DCE3ED',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  categorySelected: {
    backgroundColor: '#EAF2FF',
    borderColor: '#246BCE',
  },

  categoryIcon: {
    fontSize: 17,
  },

  categoryText: {
    color: '#475467',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  categoryTextSelected: {
    color: '#246BCE',
    fontWeight: '800',
  },

  checkmark: {
    color: '#246BCE',
    fontWeight: 'bold',
  },

  uploadHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionalText: {
    color: '#D92D20',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 20,
  },

  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#8DB6F3',
    borderRadius: 13,
    padding: 23,
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },

  uploadIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E1EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  uploadIcon: {
    color: '#246BCE',
    fontSize: 27,
    fontWeight: 'bold',
  },

  uploadTitle: {
    color: '#246BCE',
    fontWeight: '800',
    fontSize: 14,
  },

  uploadDescription: {
    color: '#7B8798',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E1E7EF',
    borderRadius: 12,
    marginTop: 14,
  },

  preview: {
    width: 95,
    height: 85,
    borderRadius: 9,
    resizeMode: 'cover',
  },

  previewDetails: {
    flex: 1,
  },

  previewTitle: {
    color: '#344054',
    fontSize: 13,
    fontWeight: 'bold',
  },

  previewSubtitle: {
    color: '#98A2B3',
    fontSize: 12,
    marginTop: 4,
  },

  removeText: {
    color: '#D92D20',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 9,
  },

  submitButton: {
    backgroundColor: '#246BCE',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    minHeight: 56,
  },

  submitDisabled: {
    opacity: 0.7,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  privacyText: {
    color: '#98A2B3',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 16,
  },

  footer: {
    color: '#98A2B3',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 25,
    textAlign: 'center',
  },
});
