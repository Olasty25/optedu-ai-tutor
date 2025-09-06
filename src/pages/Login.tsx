import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext"; // Zakładamy, że to jest poprawna ścieżka

// --- Firebase Imports ---
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase"; // WAŻNE: Upewnij się, że ścieżka do Twojego pliku firebase.js jest poprawna!
// --- Koniec Firebase Imports ---

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Stan do wyświetlania błędów z Firebase
  const [loading, setLoading] = useState(false); // Stan do zarządzania ładowaniem (wyłączanie przycisków itp.)

  // Funkcja do logowania za pomocą emaila i hasła (zastępuje handleLogin)
  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Wyczyść poprzednie błędy
    setLoading(true); // Ustaw stan ładowania

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase automatycznie zarządza sesjami użytkowników.
      // Nie potrzebujesz już localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard"); // Przekieruj na dashboard po pomyślnym zalogowaniu
    } catch (err: any) { // Użyj 'any' lub bardziej szczegółowego typu błędu, jeśli znasz
      setError(err.message); // Wyświetl komunikat błędu z Firebase
      console.error("Login error:", err);
    } finally {
      setLoading(false); // Zawsze zresetuj stan ładowania
    }
  };

  // Funkcja do logowania za pomocą Google
  const handleGoogleSignIn = async () => {
    setError(null); // Wyczyść poprzednie błędy
    setLoading(true); // Ustaw stan ładowania
    const provider = new GoogleAuthProvider(); // Utwórz instancję providera Google

    try {
      await signInWithPopup(auth, provider); // Otwórz popup Google do logowania
      navigate("/dashboard"); // Przekieruj na dashboard po pomyślnym zalogowaniu przez Google
    } catch (err: any) {
      // Obsługa błędów, np. użytkownik zamknął popup lub inne problemy
      setError(err.message);
      console.error("Google login error:", err);
    } finally {
      setLoading(false); // Zawsze zresetuj stan ładowania
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <BookOpen className="h-10 w-10 text-white" />
            <span className="text-3xl font-bold text-white">Optedu AI</span>
          </Link>
          <p className="text-white/80">Welcome back to your learning journey</p>
        </div>

        <Card className="shadow-glow border-white/10 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
            <CardDescription>
              {t('auth.loginSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && ( // Wyświetl komunikat o błędzie, jeśli istnieje
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                  disabled={loading} // Wyłącz inputy podczas ładowania
                />
              </div>
              <div>
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                  disabled={loading} // Wyłącz inputy podczas ładowania
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-90"
                disabled={loading} // Wyłącz przycisk podczas ładowania
              >
                {loading ? "Logging in..." : t('auth.loginButton')} {/* Zmień tekst przycisku podczas ładowania */}
              </Button>
            </form>

            <div className="my-6 flex items-center before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300">
              <p className="text-center mx-4 text-gray-500">
                {t('common.or') || "OR"} {/* Dodaj klucz tłumaczenia lub fallback */}
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              disabled={loading} // Wyłącz przycisk Google podczas ładowania
            >
              {/* Ikona Google - możesz ją pobrać lub użyć innej z biblioteki ikon */}
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google logo" className="h-5 w-5" />
              {loading ? "Signing in..." : (t('auth.signInWithGoogle') || "Sign in with Google")} {/* Dodaj klucz tłumaczenia lub fallback */}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.newUser')}{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  {t('auth.createAccount')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
