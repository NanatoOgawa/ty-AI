export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">デバッグ情報</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">環境変数</h2>
          <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定'}</p>
          <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定'}</p>
          <p>GOOGLE_AI_API_KEY: {process.env.GOOGLE_AI_API_KEY ? '設定済み' : '未設定'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">リンク</h2>
          <a href="/login" className="text-blue-600 hover:underline">ログインページ</a>
        </div>
      </div>
    </div>
  );
}
