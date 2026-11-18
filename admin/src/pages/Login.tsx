import { useState } from 'react';
import { repo } from '../repo';

export function Login({ onLogin }: { onLogin: (u: { email: string }) => void }) {
  const [email, setEmail] = useState(repo.mode === 'demo' ? 'admin@example.com' : '');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
        <img src="/favicon.png" alt="" width={56} height={56} />
        <h1>
          Koto<span className="red">venture</span> Admin
        </h1>
        <p className="dim">Korea Touring Game Adventure · 관리자</p>
        <input placeholder="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <input placeholder="비밀번호" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
        {err && <div className="err">{err}</div>}
        <button type="submit" disabled={busy}>
          {busy ? '로그인 중…' : '로그인'}
        </button>
        {repo.mode === 'demo' ? (
          <p className="hint">
            ● <b>데모 모드</b>: Supabase 환경변수가 없어 브라우저 localStorage에 저장됩니다. 아무 비밀번호로 로그인하세요.
          </p>
        ) : (
          <p className="hint">테스트 계정(로컬 시드): admin@example.com / Admin1234!</p>
        )}
      </form>
    </div>
  );
}
