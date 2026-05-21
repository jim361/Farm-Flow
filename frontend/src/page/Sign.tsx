import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail } from "lucide-react";

export default function Sign() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    userEmail: "",
  });
  const [error, setError] = useState("");

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim() || !form.passwordConfirm.trim()) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    const idRegex = /^[a-zA-Z0-9]{6}$/;
    if (!idRegex.test(form.email)) {
      setError("아이디는 영문 또는 숫자 조합으로 6자여야 합니다.");
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 6) {
      setError("비밀번호는 영문, 숫자 포함 6자 이상이어야 합니다.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("ff_users") || "[]");
    if (users.find((u: any) => u.email === form.email)) {
      setError("이미 존재하는 아이디입니다.");
      return;
    }

    users.push({
      email: form.email,
      password: form.password,
      userEmail: form.userEmail || "",
    });
    localStorage.setItem("ff_users", JSON.stringify(users));

    try {
      await fetch("http://localhost:8080/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.userEmail || undefined,
          password: form.password,
          name: form.email,
        }),
      });
    } catch {
      // 백엔드 미연결
    }

    alert("회원가입이 완료되었습니다!");
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2D5A27" />
            <path d="M16 6c-2 4-6 8-6 14a6 6 0 0012 0c0-6-4-10-6-14z" fill="#fff" />
          </svg>
        </div>
        <h1 className="auth-logo-title">Smart Farm</h1>
        <p className="auth-logo-sub">디지털 온실 관리 시스템</p>
      </div>

      <div className="auth-card">
        <h2 className="auth-card-title">회원가입</h2>
        <p className="auth-card-desc">데이터로 관리하는 스마트 팜의 시작.</p>

        <form onSubmit={handleSignup}>
          <div className="auth-field">
            <label>아이디</label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder="영문/숫자 6자"
                value={form.email}
                maxLength={6}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                  update("email", v);
                }}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>비밀번호</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                type="password"
                placeholder="영문, 숫자 포함 6자 이상"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>비밀번호 확인</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={form.passwordConfirm}
                onChange={(e) => update("passwordConfirm", e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>이메일</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="example@email.com"
                value={form.userEmail}
                onChange={(e) => update("userEmail", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            회원가입 완료 →
          </button>
        </form>

        <div className="auth-links">
          <span>이미 계정이 있으신가요?</span>
          <span className="auth-link-highlight" onClick={() => navigate("/login")}>
            로그인하기
          </span>
        </div>
      </div>
    </div>
  );
}