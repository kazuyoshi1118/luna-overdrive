# LUNA OVERDRIVE｜DAYBREAK DUEL

10人のAIエージェントからキャラクターを選び、昼を奪い合う2D格闘ゲーム。`LUNA SUN CATCH!`で集めた昼を、今度は必殺技に変える。

## 現在の遊び方

- **VS CPU**：ネコムシカとベスト・オブ・3で対戦
- **TRAINING MODE**：CPUが動かない状態でコンボと必殺技を確認
- **移動**：A / D
- **ジャンプ**：W
- **ガード**：S
- **攻撃**：J LIGHT、K HEAVY、L DAYBREAK、I OVERDRIVE
- **タッチ操作**：スマートフォンでは画面下のボタンを使用
- **キャラクター選択**：10人のロスターからYOU／CPUを選択
- **選択画面**：選択中のエージェントの役割・SPECIAL・OVERDRIVEを確認してから開始。BACKでタイトルへ戻れる
- **キャラクター差**：体力、速度、ジャンプ力、攻撃の威力・射程・必殺技名が変化
- **演出差**：キャラクターのアクセントカラーがHUD、勝敗表示、オーラ、必殺技演出に反映
- **サウンド**：SOUNDボタンでWeb Audioの打撃・ガード・必殺技・勝敗音を切り替え
- **対戦UI**：ラウンド勝利数をHUDに表示。PキーまたはPAUSE（スマホにも表示）で一時停止・再開
- **共有**：試合後に結果文・GRADE・最大コンボを共有／コピーできる
- **操作感**：攻撃中に次の入力を受け付ける短い入力バッファで、連携をつなぎやすくしている

## ビジュアルアセット

- `assets/overdrive-stage-bg.png`：キャラクターを重ねる昼の東京スタジオ背景
- `assets/overdrive-stage.png`：タイトル画面用キービジュアル
- `assets/luna-overdrive-luna.png`：太陽の必殺技を持つルナの切り抜き
- `assets/nekomusica-overdrive.png`：紫の音波を放つネコムシカの切り抜き
- `assets/kagari.png`：ソーラーガントレットを持つ高速型KAGARIの切り抜き
- `assets/mizuki.png`：音波パネルを操る遠距離型MIZUKIの切り抜き
- `assets/bolt9.png`：耐久型ロボットBOLT-9の切り抜き
- `assets/vanta.png`：高火力の魔人VANTAの切り抜き
- `assets/sylfa.png`：風を操るエルフSYLFAの切り抜き
- `assets/ryuga.png`：炎を纏う竜人RYUGAの切り抜き
- `assets/piko.png`：跳ね回るスライムPIKOの切り抜き
- `assets/orbis.png`：星片を操る宇宙種族ORBISの切り抜き

キャラクター画像はクロマキー生成後にアルファ付きPNGへ変換し、ゲーム内のCanvas描画へ接続しています。

## 作品としての設計

1. ルナの「昼を守る」という目的を、ゲージと必殺技に変換する
2. 1試合で勝敗・コンボ・グレードが出るため、Xで結果を共有しやすくする
3. キャラクター、技、ステージ、CPUの順に増やせるよう、戦闘ロジックと描画を分離する

## 検証

```bash
node --check game.js
node smoke-test.mjs
```

この作品は外部ライブラリなしのCanvasゲーム。GitHub Pagesでそのまま公開できる構成です。
