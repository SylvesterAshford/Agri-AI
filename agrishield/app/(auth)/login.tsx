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
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

const C = Colors.light;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('အမှား', 'အီးမေးလ်နှင့် စကားဝှက်ကို ဖြည့်ပါ');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('ဝင်ရောက်၍မရ', error.message || 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားနေပါသည်');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Feather name="shield" size={40} color={C.primary} />
        </View>
        <Text style={styles.logoTitle}>AgriShield</Text>
        <Text style={styles.logoSubtitle}>မြန်မာ တောင်သူများ ပလပ်ဖောင်း</Text>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>အီးမေးလ်</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={18} color={C.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="farmer@example.com"
              placeholderTextColor={C.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>စကားဝှက်</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={18} color={C.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={C.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color={C.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ဝင်ရောက်မည်</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>အကောင့်မရှိသေးပါလား? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>မှတ်ပုံတင်မည်</Text>
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
    padding: 24,
    paddingTop: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 14,
    color: C.textSecondary,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: C.text,
  },
  eyeIcon: {
    padding: 4,
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
