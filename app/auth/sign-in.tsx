import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../stores/auth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { signIn, signInWithGoogle, error, isLoading, clearError } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Verifica se há erro nos parâmetros da URL
  useEffect(() => {
    if (params.error) {
      const errorMessages = {
        'google_signin_failed': 'Falha no login com Google. Tente novamente.',
        'signin_exception': 'Erro no processo de login. Verifique sua conexão.',
        'network_error': 'Erro de conexão. Verifique sua internet.',
        'auth_failed': 'Credenciais inválidas. Tente novamente.'
      };
      
      const errorMessage = errorMessages[params.error as string] || 'Erro desconhecido no login.';
      setLocalError(errorMessage);
      
      // Limpa o parâmetro de erro da URL após processar
      router.replace('/auth/sign-in');
      
      // Limpa o erro após 5 segundos
      setTimeout(() => setLocalError(''), 5000);
    }
  }, [params.error]);

  // Limpa erros quando o componente é montado
  useEffect(() => {
    if (clearError) {
      clearError();
    }
  }, [clearError]);

  const handleSignIn = async () => {
    try {
      setLocalError(''); // Limpa erros locais
      if (clearError) clearError(); // Limpa erros do store
      
      const result = await signIn(email, password);
      
      if (!error && !result?.error) {
        // O redirecionamento será feito pelo _layout.tsx
        console.log('Login bem-sucedido');
      } else {
        console.error('Erro no login:', error || result?.error);
        setLocalError('Falha no login. Verifique suas credenciais.');
      }
    } catch (err) {
      console.error('Exceção capturada no handleSignIn:', err);
      setLocalError('Erro inesperado. Tente novamente.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(''); // Limpa erros locais
      if (clearError) clearError(); // Limpa erros do store
      
      console.log('Iniciando login com Google...');
      
      const result = await signInWithGoogle();
      
      // Aguarda um pouco para o estado ser atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verifica se ainda há erro após a tentativa
      if (error || result?.error) {
        console.error('Erro no Google Sign-In:', error || result?.error);
        setLocalError('Falha no login com Google. Tente novamente.');
        return;
      }
      
      console.log('Login Google bem-sucedido');
      // O redirecionamento será feito pelo _layout.tsx automaticamente
      
    } catch (err) {
      console.error('Exceção capturada no handleGoogleSignIn:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
        fullError: err
      });
      
      // Define erro local em vez de redirecionar
      let errorMessage = 'Erro no login com Google. Tente novamente.';
      if (err.message?.includes('network') || err.message?.includes('connection')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (err.message?.includes('cancelled') || err.message?.includes('canceled')) {
        errorMessage = 'Login cancelado pelo usuário.';
      }
      
      setLocalError(errorMessage);
    }
  };

  // Função para limpar todos os erros
  const clearAllErrors = () => {
    setLocalError('');
    if (clearError) clearError();
  };

  // Mostra erro local ou do store
  const displayError = localError || error;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800' }}
          style={styles.backgroundImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
      </View>

      <View style={styles.form}>
        {/* Exibe erro com estilo melhorado */}
        {/* {displayError && (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{displayError}</Text>
            <TouchableOpacity 
              onPress={clearAllErrors}
              style={styles.errorClose}
            >
              <Text style={styles.errorCloseText}>×</Text>
            </TouchableOpacity>
          </View>
        )} */}

        <TouchableOpacity 
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>
            {isLoading ? 'Conectando...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        {/* Botão para tentar novamente em caso de erro */}
        {displayError && !isLoading && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              clearAllErrors();
              handleGoogleSignIn();
            }}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        )}

        {/* Botão de debug (remover em produção) */}
        {/* {__DEV__ && (
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={() => {
              console.log('Estado atual:', {
                error,
                localError,
                isLoading,
                params
              });
            }}
          >
            <Text style={styles.debugButtonText}>Debug Info</Text>
          </TouchableOpacity>
        )} */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 300,
    justifyContent: 'flex-end',
    padding: 20,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: 300,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.8,
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0891b2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    color: '#6b7280',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#0891b2',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  errorClose: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  errorCloseText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#6b7280',
    fontSize: 12,
  },
});