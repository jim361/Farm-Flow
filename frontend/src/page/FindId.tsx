import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import { API_BASE_URL } from "../api/api";

export default function FindId() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFind = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const normalizedName = userName.trim();
    if (!normalizedName) {
      setError("가입할 때 등록한 이름을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/find-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalizedName }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.email);
      } else {
        const err = await res.json().catch(() => null);
        setError(err?.error || "일치하는 계정을 찾을 수 없습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
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
        <h2 className="auth-card-title">아이디 찾기</h2>
        <p className="auth-card-desc">회원가입 시 등록한 이름을 입력하면 로그인 이메일을 확인할 수 있습니다.</p>

        <form onSubmit={handleFind}>
          <div className="auth-field">
            <label>이름</label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder="가입한 이름을 입력해주세요"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          {result && (
            <div className="auth-result">
              <p className="auth-result-label">로그인 이메일</p>
              <p className="auth-result-value">{result}</p>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            <Search size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            {loading ? "검색 중..." : "아이디 찾기"}
          </button>
        </form>

        <div className="auth-links">
          <span className="auth-link-highlight" onClick={() => navigate("/login")}>로그인으로 돌아가기</span>
          <span className="auth-links-dot">·</span>
          <span className="auth-link-highlight" onClick={() => navigate("/find-pw")}>비밀번호 찾기</span>
        </div>
      </div>
    </div>
  );
}
