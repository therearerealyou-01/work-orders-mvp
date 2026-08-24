import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { homePath } from "../../routes/paths";
import { Button, Field, Input, Password } from "../../ui";
import cl from "./LoginPage.module.css";
import { isEmail } from "../../lib/validators";

export function LoginPage() {
  const { login, confirm2fa } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"login" | "2fa">("login");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("operator@demo.local");
  const [password, setPassword] = useState("Passw0rd!");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    code?: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function onLogin(event: FormEvent) {
    event.preventDefault();

    const next: typeof errors = {};

    if (!isEmail(email)) {
      next.email = "Неверный формат email";
    }

    if (!password) {
      next.password = "Введите пароль";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const result = await login(email, password);
      setChallengeId(result.challengeId);
      setDevCode(result.devCode ?? null);
      setStep("2fa");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm(event: FormEvent) {
    event.preventDefault();

    if (!challengeId) {
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: "Код из 6 цифр" });
      return;
    }

    setErrorMessage("");
    setErrors({});
    setLoading(true);

    try {
      const user = await confirm2fa(challengeId, code);
      navigate(homePath(user.role), { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cl.root}>
      <div className={cl.container}>
        <h1 className={cl.title}>Диспетчерская</h1>

        <p className={cl.description}>Система нарядов для полевых бригад</p>

        <div className={cl.forms}>
          {step === "login" ? (
            <form onSubmit={(event) => void onLogin(event)} className={cl.form}>
              <Field label="Электронная почта" error={errors.email}>
                <Input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field label="Пароль" error={errors.password}>
                <Password
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <Button type="submit" block loading={loading}>
                Войти
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(event) => void onConfirm(event)}
              className={cl.form}
            >
              <div className={cl.wrapper}>
                <p className={cl.label}>SMS-код подтверждения:</p>

                <div className={cl.code}>{devCode}</div>
              </div>

              <Field label="Код подтверждения" error={errors.code}>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </Field>

              <Button type="submit" block loading={loading}>
                Подтвердить
              </Button>

              <Button
                variant="ghost"
                block
                onClick={() => {
                  setStep("login");
                  setChallengeId(null);
                  setDevCode(null);
                  setCode("");
                  setErrors({});
                }}
              >
                Назад
              </Button>
            </form>
          )}
        </div>

        <p className={cl.error}>{errorMessage}</p>

        <div className={cl.credentions}>
          <p className={cl.label}>operator@demo.local</p>

          <p className={cl.label}>team1@demo.local</p>

          <p className={cl.label}>team2@demo.local</p>

          <p className={cl.label}>Пароль для всех: Passw0rd!</p>
        </div>
      </div>
    </div>
  );
}
