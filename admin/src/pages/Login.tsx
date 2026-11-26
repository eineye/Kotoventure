import { useState } from 'react';
import { connectServer, disconnectServer, repo, serverSource } from '../repo';

export function Login({ onLogin }: { onLogin: (u: { email: string }) => void }) {
  const [email, setEmail] = useState(repo.mode === 'demo' ? 'admin@example.com' : '');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showServer, setShowServer] = useState(false);
  const [sUrl, setSUrl] = useState('');
  const [sKey, setSKey] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await repo.signIn(email, pw);
      onLogin((await repo.session()) ?? { email });
    } catch (x: any) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form onSubmit={submit} className="login-card">
        <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" width={56} height={56} />
        <h1>
          Koto<span className="red">venture</span> Admin
        </h1>
        <p className="dim">Korea Touring Mission Adventure · 관리자</p>
        <input placeholder="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <input placeholder="비밀번호" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
        {err && <div className="err">{err}</div>}
        <button type="submit" disabled={busy}>
          {busy ? '로그인 중…' : '로그인'}
        </button>
        {repo.mode === 'demo' ? (
          <p className="hint">
            ● <b>데모 모드</b>: 서버에 연결되지 않아 이 브라우저에만 저장됩니다. 아무 비밀번호로 로그인하세요.
          </p>
        ) : (
          <p className="hint">● <b>Supabase 서버에 연결됨</b> – Supabase에서 만든 관리자 계정으로 로그인하세요.</p>
        )}

        {serverSource !== 'env' && (
          <div className="server-box">
            {serverSource === 'browser' ? (
              <button type="button" className="ghost small" onClick={() => confirm('서버 연결을 해제하고 데모 모드로 돌아갈까요?') && disconnectServer()}>
                서버 연결 해제 (데모 모드)
              </button>
            ) : !showServer ? (
              <button type="button" className="ghost small" onClick={() => setShowServer(true)}>
                🔌 Supabase 서버 연결
              </button>
            ) : (
              <>
                <p className="hint">Supabase → Project Settings → API (또는 Data API)에서 복사하세요.</p>
                <input placeholder="Project URL (https://xxxx.supabase.co)" value={sUrl} onChange={(e) => setSUrl(e.target.value)} />
                <input placeholder="anon public key (eyJ… 또는 sb_publishable_…)" value={sKey} onChange={(e) => setSKey(e.target.value)} />
                <button
                  type="button"
                  disabled={!/^https:\/\/.+/.test(sUrl.trim()) || sKey.trim().length < 20}
                  onClick={() => connectServer(sUrl, sKey)}
                >
                  연결하기
                </button>
                <p className="hint">⚠️ service_role 키는 절대 넣지 마세요. anon(공개) 키만 사용합니다.</p>
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
