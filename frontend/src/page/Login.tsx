import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      const data = await res.json();
      // JWT 토큰 저장
      localStorage.setItem("token", data.token);
      // 메인 페이지로 이동
      navigate("/dashboard");
    } catch {
      setError("서버에 연결할 수 없습니다.");
    }
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
        <h2 className="auth-card-title">로그인</h2>
        <p className="auth-card-desc">서비스를 이용하려면 계정에 로그인하세요.</p>

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label>아이디</label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder="아이디를 입력해주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>비밀번호</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            로그인 →
          </button>
        </form>

        // Login.tsx 등에 임시로 추가
<button onClick={() => navigate("/dashboard")} style={{marginTop: '10px', color: '#888'}}>
  (개발용) 로그인 건너뛰기
</button>

        <div className="auth-links">
          <span>아이디 찾기</span>
          <span className="auth-links-dot">·</span>
          <span>비밀번호 찾기</span>
          <span className="auth-links-dot">·</span>
          <span className="auth-link-highlight" onClick={() => navigate("/signup")}>
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}