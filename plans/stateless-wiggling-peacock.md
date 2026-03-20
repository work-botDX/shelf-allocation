# 戦略SRPG 修正計画書

## Context
ユーザーから2つの修正依頼を受けた：
1. ユニット選択時に画面が上下にブレる問題の修正
2. キャンセルコマンドを待機コマンドの下に配置

## 修正内容

### 1. キャンセルコマンドの位置変更
**ファイル**: [ActionMenu.tsx](srpg-game/src/components/game/ActionMenu.tsx)

**現状**: メニュー順序が「キャンセル、攻撃、支援、待機」
**修正後**: メニュー順序を「攻撃、支援、待機、キャンセル」に変更

**変更箇所**: 31-36行目のmenuItems配列の順序を変更

```typescript
// 変更前
const menuItems = [
  { id: 'cancel', label: 'キャンセル', action: onCancel, enabled: true },
  { id: 'attack', label: '攻撃', action: onAttack, enabled: hasAttackableEnemies },
  { id: 'support', label: '支援', action: onSupport, enabled: hasSupportPartners },
  { id: 'wait', label: '待機', action: onWait, enabled: true },
];

// 変更後
const menuItems = [
  { id: 'attack', label: '攻撃', action: onAttack, enabled: hasAttackableEnemies },
  { id: 'support', label: '支援', action: onSupport, enabled: hasSupportPartners },
  { id: 'wait', label: '待機', action: onWait, enabled: true },
  { id: 'cancel', label: 'キャンセル', action: onCancel, enabled: true },
];
```

### 2. 画面ブレ修正
**原因分析**:
- ユニット選択時にUnitStatusPanelの内容が変化
- サイドパネルの高さが変わることでマップ領域のセンタリングに影響

**修正案**: [App.tsx](srpg-game/src/App.tsx)のサイドパネルに固定高さを設定

**変更箇所**: 384行目のaside要素

```typescript
// 変更前
<aside className="w-72 bg-gray-800 p-4 text-white overflow-y-auto">

// 変更後（高さを制限してマップ領域への影響を防ぐ）
<aside className="w-72 bg-gray-800 p-4 text-white overflow-y-auto h-full">
```

または、マップ領域のコンテナに明示的な高さを設定：

```typescript
// 変更前
<div className="flex-1 flex items-center justify-center p-4">

// 変更後
<div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
```

## 検証方法
1. `cd srpg-game && npm run dev` で開発サーバーを起動
2. ゲームを開始し、ユニットをクリックして選択
3. 画面がブレないことを確認
4. 行動メニューで「キャンセル」が一番下にあることを確認

## 影響範囲
- ActionMenu.tsx: メニュー順序のみの変更（機能への影響なし）
- App.tsx: レイアウト調整（UIへの影響は軽微）
