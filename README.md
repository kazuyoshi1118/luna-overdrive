# LUNA OVERDRIVE｜DAYBREAK LAB

10人のAIエージェントからキャラクターを選び、昼を奪い合う2D格闘ゲーム。`LUNA SUN CATCH!`で集めた昼を、今度は必殺技に変える。

BUILD 3.0では、対戦を「遊ぶ」だけでなく、フレームを「研究」し、アーケードの進行を「続ける」作品へ拡張しています。

## 現在の遊び方

- **VS CPU**：ネコムシカとベスト・オブ・3で対戦
- **TRAINING MODE**：CPUが動かない状態でコンボと必殺技を確認
- **移動**：A / D
- **ジャンプ**：W
- **ガード**：S
- **PARRY**：ガード中にSを短く押す。成功すると相手のターンを奪う
- **投げ**：U。ガードを崩す近距離攻撃
- **DRIVE BURST**：O。ゲージ300を使い、被弾中でも切り返せる
- **攻撃**：J LIGHT、K HEAVY、L DAYBREAK、I OVERDRIVE
- **ASSIST COMBO**：E。ASSISTがONなら、J→K→SPECIALをワンボタンでつなぐ
- **ダッシュ**：A A / D D
- **タッチ操作**：スマートフォンでは画面下のボタンを使用
- **キャラクター選択**：10人のロスターからYOU／CPUを選択
- **選択画面**：選択中のエージェントの役割・SPECIAL・OVERDRIVEを確認してから開始。BACKでタイトルへ戻れる
- **キャラクター差**：体力、速度、ジャンプ力、攻撃の威力・射程・必殺技名が変化
- **演出差**：キャラクターのアクセントカラーがHUD、勝敗表示、オーラ、必殺技演出に反映
- **サウンド**：SOUNDボタンでWeb Audioの打撃・ガード・必殺技・勝敗音を切り替え
- **対戦UI**：ラウンド勝利数をHUDに表示。PキーまたはPAUSE（スマホにも表示）で一時停止・再開
- **共有**：試合後に結果文・GRADE・最大コンボを共有／コピーできる
- **操作感**：攻撃中に次の入力を受け付ける短い入力バッファで、連携をつなぎやすくしている
- **初心者導線**：選択画面のASSISTをONにすると、ワンボタン連携で格闘ゲームの気持ちよさを先に体験できる
- **読み合い**：打撃・ガード・投げの三すくみ、短いPARRY、ゲージを攻め／守りに使うDRIVE BURSTを搭載
- **モーション**：動画素材に依存せず、待機・歩行・ダッシュ・ジャンプ・攻撃・被弾・ガード・PARRYごとにCanvas上の姿勢変化と残像を生成
- **ゲームパッド**：標準ゲームパッドの移動、ガード、攻撃、投げ、BURST、ポーズに対応
- **FRAME LAB**：FキーまたはFRAME LABボタンで、トレーニング中にヒットボックス、攻撃判定、STARTUP／ACTIVE／RECOVERYを表示
- **アーケード進行**：勝利でDAY SHARDSとRUN SCOREを獲得。次の対戦へ一部ゲージを持ち越し、全9戦のクリアを記録
- **プロフィール**：勝利数、最高コンボ、アーケード制覇数、累積SHARDSをブラウザ内に保存

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
2. 1試合で勝敗・コンボ・グレード・SHARDS・RUN SCOREが出るため、Xで結果を共有しやすくする
3. FRAME LABで攻撃判定を見える化し、初心者の遊びと上級者の研究を同じ画面に置く
4. キャラクター、技、ステージ、CPUの順に増やせるよう、戦闘ロジックと描画を分離する

## 検証

```bash
node --check game.js
node smoke-test.mjs
git diff --check
```

この作品は外部ライブラリなしのCanvasゲーム。GitHub Pagesでそのまま公開できる構成です。
