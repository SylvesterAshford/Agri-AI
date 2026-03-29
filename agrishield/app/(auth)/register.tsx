import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

const C = Colors.light;

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    township: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        township: formData.township,
        password: formData.password,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the farming community</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="ဦးစောလှိုင်"
            placeholderTextColor={C.textSecondary}
            value={formData.name}
            onChangeText={(value) => setFormData({ ...formData, name: value })}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="farmer@example.com"
            placeholderTextColor={C.textSecondary}
            value={formData.email}
            onChangeText={(value) => setFormData({ ...formData, email: value })}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+959123456789"
            placeholderTextColor={C.textSecondary}
            value={formData.phone}
            onChangeText={(value) => setFormData({ ...formData, phone: value })}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Township *</Text>
          <TextInput
            style={styles.input}
            placeholder="ညောင်ဦး"
            placeholderTextColor={C.textSecondary}
            value={formData.township}
            onChangeText={(value) => setFormData({ ...formData, township: value })}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={C.textSecondary}
            value={formData.password}
            onChangeText={(value) => setFormData({ ...formData, password: value })}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={C.textSecondary}
            value={formData.confirmPassword}
            onChangeText={(value) => setFormData({ ...formData, confirmPassword: value })}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: C.textSecondary,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  input: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  button: {
    backgroundColor: C.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: C.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: C.primary,
    fontWeight: '600',
  },
});
