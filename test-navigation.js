// 遷移テスト用スクリプト
// このスクリプトは、ブラウザの開発者ツールで実行できます

console.log('🚀 遷移テストを開始します...');

// テスト対象のURL一覧
const testUrls = [
  '/',
  '/login',
  '/dashboard',
  '/dashboard/customers',
  '/dashboard/history',
  '/dashboard/tone-analysis',
  '/dashboard/notes',
  '/dashboard/create',
  '/dashboard/create/from-notes',
  '/dashboard/create/result'
];

// 遷移テスト関数
async function testNavigation() {
  console.log('📋 遷移テスト開始');
  
  for (const url of testUrls) {
    try {
      console.log(`🔍 テスト中: ${url}`);
      
      // 現在のURLを保存
      const currentUrl = window.location.href;
      
      // 新しいURLに遷移
      window.location.href = url;
      
      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 遷移後のURLを確認
      const newUrl = window.location.href;
      
      if (newUrl.includes(url) || newUrl.endsWith(url)) {
        console.log(`✅ 成功: ${url} への遷移が完了しました`);
      } else {
        console.log(`⚠️  警告: ${url} への遷移が期待通りではありません`);
        console.log(`   期待: ${url}`);
        console.log(`   実際: ${newUrl}`);
      }
      
      // 元のURLに戻る
      window.location.href = currentUrl;
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ エラー: ${url} のテスト中にエラーが発生しました`, error);
    }
  }
  
  console.log('🎉 遷移テスト完了');
}

// 認証状態のチェック
function checkAuthState() {
  console.log('🔐 認証状態をチェック中...');
  
  // localStorageから認証情報を確認
  const authData = localStorage.getItem('supabase.auth.token');
  if (authData) {
    console.log('✅ 認証情報が見つかりました');
    try {
      const parsed = JSON.parse(authData);
      console.log('認証データ:', parsed);
    } catch (e) {
      console.log('認証データの解析に失敗しました');
    }
  } else {
    console.log('⚠️  認証情報が見つかりません');
  }
}

// ページ読み込み時の自動テスト
function autoTest() {
  console.log('🤖 自動テストを開始します...');
  
  // 認証状態をチェック
  checkAuthState();
  
  // 現在のページの基本情報を表示
  console.log('📄 現在のページ情報:');
  console.log('  - URL:', window.location.href);
  console.log('  - タイトル:', document.title);
  console.log('  - パス:', window.location.pathname);
  
  // エラーの有無をチェック
  const errors = window.performance.getEntriesByType('resource')
    .filter(entry => entry.name.includes('error') || entry.name.includes('failed'));
  
  if (errors.length > 0) {
    console.log('⚠️  リソースエラーが見つかりました:', errors);
  } else {
    console.log('✅ リソースエラーは見つかりませんでした');
  }
}

// グローバル関数として公開
window.testNavigation = testNavigation;
window.checkAuthState = checkAuthState;
window.autoTest = autoTest;

// ページ読み込み時に自動テストを実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoTest);
} else {
  autoTest();
}

console.log('🎯 遷移テストスクリプトが読み込まれました');
console.log('使用方法:');
console.log('  - testNavigation() : 全URLの遷移テスト');
console.log('  - checkAuthState() : 認証状態のチェック');
console.log('  - autoTest() : 自動テストの実行'); 