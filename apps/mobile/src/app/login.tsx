import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native'
import { Redirect, router } from 'expo-router'
import { Button } from '../components/Button'
import { Screen } from '../components/Screen'
import { Text, Title } from '../components/Typography'
import { useApp } from '../data/AppContext'
import { font, radius, useCoteTheme } from '../theme'

// 웹과 같은 계정으로 로그인한다. 말로 푼 기록이 계정에 남는다.
export default function LoginScreen() {
  const { user, loading, login, signup } = useApp()
  const { theme } = useCoteTheme()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Redirect href="/" />

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') await login(email.trim(), password)
      else await signup(email.trim(), nickname.trim(), password)
      router.replace('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : '요청에 실패했습니다')
    } finally {
      setBusy(false)
    }
  }

  const input = {
    ...font.body,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.md,
    backgroundColor: theme.container,
    color: theme.text,
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingTop: 48 }} keyboardShouldPersistTaps="handled">
          <View>
            <Title level={4} style={{ color: theme.primary }}>
              COTE
            </Title>
            <Title level={3} style={{ marginTop: 8 }}>
              {mode === 'login' ? '로그인' : '회원가입'}
            </Title>
            <Text type="secondary">코드 대신 말로 풀이를 설명하고, AI 코치와 정답까지 가 보세요.</Text>
          </View>
          <View style={{ gap: 10 }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              placeholderTextColor={theme.textQuaternary}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={input}
            />
            {mode === 'signup' && (
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임 (2~20자)"
                placeholderTextColor={theme.textQuaternary}
                autoCapitalize="none"
                style={input}
              />
            )}
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호 (8자 이상)"
              placeholderTextColor={theme.textQuaternary}
              secureTextEntry
              style={input}
            />
          </View>
          {error && (
            <Text small style={{ color: '#DC2626' }}>
              {error}
            </Text>
          )}
          <Button type="primary" size="large" block disabled={busy || !email || !password} onPress={submit}>
            {busy ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </Button>
          <Button type="text" onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} fontWeight="400">
            {mode === 'login' ? '계정이 없나요? 회원가입' : '이미 계정이 있나요? 로그인'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
