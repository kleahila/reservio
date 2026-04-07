import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("anna@example.com");
  const [password, setPassword] = useState("demo123");
  const [toast, setToast] = useState({ message: "", type: "info" });

  const handleLogin = () => {
    const ok = login(email, password);
    setToast({
      message: ok ? "Logged in successfully" : "Invalid login",
      type: ok ? "success" : "error",
    });
  };

  return (
    <>
      <Card title="Guest Login">
        {/* TODO: Build full UI - see Week 7 work split doc */}
        <div className="space-y-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <Button onClick={handleLogin}>Login</Button>
        </div>
      </Card>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
    </>
  );
}

export default Login;
