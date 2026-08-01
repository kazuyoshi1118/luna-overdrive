# LUNA OVERDRIVE｜3D DAYBREAK

10人のAIエージェントからキャラクターを選び、昼を奪い合う2D格闘ゲーム。`LUNA SUN CATCH!`で集めた昼を、今度は必殺技に変える。

BUILD 3.29では、対戦を「遊ぶ」だけでなく、試合後のFIGHT LOGからフレームを「研究」し、3D画面内にもLOCAL ONLYの3D FIGHT LOGを追加して、CPU TELEGRAPH、HIT／BLOCK／COUNTER／PUNISH、THROW TECH、ラウンド結果を正確な発生フレームで確認できるようにし、試合終了時には3D MATCH REPORTからREMATCH／BACK TO 2Dを選べるようにしました。2D／3DのTRAINING MODEで反撃と三すくみを反復し、3D PUNISH DRILL／3D MIXUP DRILLで空振り反撃と立ち・しゃがみ・投げの読み合いを検証し、3D FRAME LABでプレイヤー／CPUのHURTBOXと攻撃判定、STARTUP／ACTIVE／RECOVERYを重ねて調整できるようにし、NORMAL／HARDの通常攻撃にはCPU TELEGRAPHを表示して反応可能な予備動作を作り、攻撃中の次ルートと入力バッファ、コンボ補正、10人それぞれの固有通常技、3D CPUの保持型防御読み、NORMAL／HARDの空振り・ガード後隙反撃、ROUND→FIGHTの開始フロー、3D SPECIALのDRIVE消費、入力結果を上書きしないフィードバック、3Dのジャンプ／空中攻撃、CPU対空とAIR LIGHT表示、しゃがみガードを投げで崩す共通ルール、3Dにも分離したBLOCKSTUN→GUARD RECOVERYを確認できる作品へ拡張しています。

3D SHOWROOMはブラウザ標準のWebGLだけで動作します。外部API、APIキー、決済処理、従量課金サービスは使用していません。

## 現在の遊び方

- **VS CPU**：ネコムシカとベスト・オブ・3で対戦
- **CPU難度**：EASYは予兆長め、NORMALは標準反応、HARDは空振りと危険なガード後隙をPUNISHし、LOW／OVERHEAD／投げへの防御読みも行う。CPU HUDでAPPROACH／PRESSURE／WHIFF PUNISH／BLOCK PUNISH／LOW GUARD／THROW TECH／QUICK RISE READ／ROLL CHASEなどの意図を確認できる
- **TRAINING MODE**：CPUが動かない状態でコンボと必殺技を確認。PUNISH DRILLではHEAVY空振り後のRECOVERYを反復し、MIXUP DRILLでは立ち／しゃがみガードにLOW・OVERHEAD・投げを試せる。CHARACTER TRIALでは選択キャラごとの勝ち筋をJ→K→Lなどの課題として練習し、入力順とCLEAR状態を表示する
- **移動**：A / D
- **ジャンプ**：W
- **ガード**：S
- **PARRY**：ガード中にSを短く押す。成功すると相手のターンを奪う
- **投げ**：U。ガードを崩す近距離攻撃
- **しゃがみ／LOW／OVERHEAD**：Cでしゃがみ、NでLOW、MでOVERHEAD。しゃがみガードはLOWを防ぎ、立ちガードはOVERHEADを防ぐ
- **投げ抜け**：相手と同じタイミングでU。投げは立ち／しゃがみガードを崩し、空中・起き上がり投げ無敵中は空振りする
- **起き上がり**：ノックダウン中にWでQUICK RISE、A／DでBACK ROLL／FORWARD ROLL。何もしなければ従来どおり自動起き上がり
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
- **キャラ固有コンボ**：通常入力ではキャラクターごとにLIGHTからの派生が変わる。LUNAはJ→K、NEKOMUSICAはJ→LOW、VANTAはJ→OVERHEAD、PIKOはJからLOW／OVERHEADへ分岐する。ASSIST COMBOは初心者向けの共通ルートとして残している
- **固有通常技**：KAGARIのJは前進するSOLAR STEP、MIZUKIのNは飛び道具になるPHASE LOW、BOLT-9のKはアーマー付きMAGNET HEAVY、PIKOのMは前進するBOUNCE OVERHEAD、ORBISのMは相手の背後へ移るORBIT SHIFT。必殺技だけでなく、通常技の選択にもキャラ差がある
- **固有技の視覚フィードバック**：SOLAR STEPは踏み込み線、PHASE LOWは低い音波、MAGNET HEAVYは磁力リングとARMOR表示、BOUNCE OVERHEADは跳ねる軌道、ORBIT SHIFTは星の軌道リングを攻撃中に描画する。入力した技の役割を、数値や名前だけでなく画面上の動きで理解できる
- **初心者導線**：選択画面のASSISTをONにすると、ワンボタン連携で格闘ゲームの気持ちよさを先に体験できる
- **読み合い**：打撃・ガード・投げの三すくみ、短いPARRY、ゲージを攻め／守りに使うDRIVE BURSTを搭載
- **ガード後隙**：BLOCKSTUN後に短いGUARD RECOVERYを置き、固めを受け続けるだけではなく、隙を見て反撃できる
- **反撃**：攻撃の発生前を潰すCOUNTER、空振り後の硬直を咎めるPUNISH COUNTERを、ダメージ・硬直・ヒットストップ・専用音・強化スパーク・ログで明確化。成立後は追撃と起き攻めへつなげる
- **モーション**：動画素材に依存せず、待機・歩行・ダッシュ・ジャンプ・攻撃・被弾・ガード・PARRYごとにCanvas上の姿勢変化と残像を生成
- **ゲームパッド**：標準ゲームパッドの移動、ガード、攻撃、投げ、BURST、ポーズに対応
- **FRAME LAB**：FキーまたはFRAME LABボタンで、トレーニング中にヒットボックス、攻撃判定、STARTUP／ACTIVE／RECOVERYを表示
- **ROUTE LAB**：キャラ固有の基本ルート、次に狙える技、QUEUED／CHAIN／SPECIAL CANCELをHUDへ表示
- **コンボ補正**：2発目以降は最大55%まで段階的にダメージを補正し、現在の補正率をCOMBO HUDへ表示
- **FIGHT LOG**：試合後にラウンド、CPU判断、OKI READ、COMBAT結果を時系列で確認。CPU ONLYフィルターにはCPU_DECISIONとOKI_READを含め、イベント選択で理由とフレーム情報を表示
- **アーケード進行**：勝利でDAY SHARDSとRUN SCOREを獲得。次の対戦へ一部ゲージを持ち越し、全9戦のクリアを記録
- **プロフィール**：勝利数、最高コンボ、アーケード制覇数、累積SHARDSをブラウザ内に保存
- **3D SHOWROOM**：10人のプロシージャル3Dエージェント、ドラッグ視点、A/D移動、Wジャンプ、Sガード、J/K攻撃、CPU反撃、HP、勝敗表示。通常時のWはジャンプ、空中ではJ/Kだけが空中攻撃として出せ、空中の相手にはLOW／THROWが空振りする。ノックダウン中のWはQUICK RISE、A/DはROLLを選べる。ニュートラルではSHOWROOM ORBITの自由視点、攻撃・硬直・起き上がり・ラウンド中はBATTLE LOCK／SIDE VIEWへ滑らかに切り替え、両者の距離に合わせてカメラ距離も調整する。フルスクリーン時は2D UIを隠し、3Dキャンバスを優先してキャラクターとステージを大きく表示する。3D TRAININGをONにするとCPUがダミーになり、DUMMY GUARD／DUMMY CROUCHで立ち・しゃがみガードを固定して、BLOCKSTUN・投げ・LOW／OVERHEADを反復できる。3D FRAME LABまたはFキーでHURTBOX、攻撃判定、STARTUP／ACTIVE／RECOVERYの状態を重ねて表示する。ダミーの体力が0になっても自動リセットする。HEAVY／SPECIAL／THROWが当たると、相手は画面上でも倒れる。CPUはQUICK RISE READ／ROLL CHASE／ROLL CHECKを表示する。NORMAL／HARDでは空振り中の相手へWHIFF PUNISH、ガードさせた後の硬直へBLOCK PUNISHを行い、EASYでは反撃を抑える。攻撃中の次入力はINPUT BUFFERへ入り、キャラごとにLIGHTから派生するCOMBO ROUTEが変わる。SPECIALは25 DRIVEを消費し、ゲージ不足時はNEED DRIVEとして発動しない。コンボ中は2発目以降に段階的なダメージ補正をかけ、HUDに現在の補正率を表示する。直近のHIT／BLOCK／COUNTER／PUNISHは、YOU／CPUそれぞれのフレーム有利不利としてFRAME DATAへ表示する。BLOCK後は2Dと同じくBLOCKSTUN中は操作・再ガードをロックし、続くGUARD RECOVERY中は次の攻撃を自動ガードできない。表示された有利不利と実際の反撃可能タイミングを一致させる。CPUの防御読みは毎フレームの点滅ではなく、攻撃の受付窓で立ち／しゃがみガードを選び、一定時間保持する。キーボード入力ではROUND READY、NEED DRIVE、HITSTOPなどの結果表示をハンドラが上書きしない。10人それぞれに固有SPECIALのラベル・射程・移動・アーマー・演出差を持たせ、ORBIT BREAKは接近位置を変える。SOUNDをONにすると外部素材なしのWeb Audioで技・HIT・BLOCK・COUNTER・PUNISH・KOを鳴らす。COUNTER／PUNISH COUNTERはダメージ・硬直・ヒットストップ・画面演出を分ける

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
- `showroom3d.js`：追加依存なしで動くWebGL 3D SHOWROOM／DUELランタイム

10人のロスターには、必殺技だけでなく固有通常技も割り当てています。LUNA＝SUN PUNCH、NEKOMUSICA＝GLITCH CLAW、KAGARI＝SOLAR STEP、MIZUKI＝PHASE LOW、BOLT-9＝MAGNET HEAVY、VANTA＝HEX MARK、SYLFA＝WIND SLICE、RYUGA＝DRAGON CRUSH、PIKO＝BOUNCE OVERHEAD、ORBIS＝ORBIT SHIFTです。数値・技名・Canvas／WebGL演出を同じキャラクター定義から管理し、選択した瞬間に距離感が変わることを目標にしています。

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

この作品は外部ライブラリなしのCanvas／WebGLゲーム。GitHub Pagesでそのまま公開できる構成です。
