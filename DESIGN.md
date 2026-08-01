# LUNA OVERDRIVE｜戦闘設計メモ

## コンセプト

「AIに任せるだけじゃない。AIと、戦う。」

ルナが集めた昼をゲージに変え、必殺技で昼のルールを書き換える。ネコムシカは、音楽と混沌でルナのルールを奪いにくる。

## 現在のプレイアブル仕様｜BUILD 3.29

| 技 | 入力 | 役割 | コスト |
|---|---|---|---:|
| LIGHT | J | 速い始動。コンボの入口 | 0 |
| HEAVY | K | 遅いが高火力。距離を取り戻す | 0 |
| THROW | U | ガードを崩す近距離の投げ | 0 |
| LOW / OVERHEAD | N / M | しゃがみガードと立ちガードを揺さぶる | 0 |
| DAYBREAK | L | キャラ固有の必殺技。LUNAは突進、NEKOMUSICAは設置、BOLT-9はアーマー | 250 |
| OVERDRIVE | I | 全画面級の切り返し。勝負を決める | 1000 |
| DRIVE BURST | O | 被弾中も使える無敵の切り返し | 300 |

### 初心者と上級者の入口

- ASSIST ONではEでLIGHT→HEAVY→SPECIALのワンボタン連携。ASSIST OFFでは通常入力だけで遊べる
- Sを押した瞬間の短いPARRY窓で、攻撃を無効化しつつ相手のターンを奪う
- 打撃はガードに止められ、投げはガードを崩し、PARRYは打撃を読む。LOW／OVERHEADが立ち・しゃがみの読み合いを追加する
- 投げは立ち／しゃがみガードの両方を崩し、空中状態と起き上がり投げ無敵だけで空振りする。しゃがみガードに固まる相手へ近距離の投げを選ぶ理由を2D／3Dで揃える
- 被弾時は攻撃を中断し、確定ヒット／ガード／投げ抜け／空振りが別の結果として表示される
- ガード後隙：BLOCKSTUN中は連続ガードを許可し、その後のGUARD RECOVERY中は次の攻撃を自動ガードできない。固めには反撃可能な出口を残す
- 3Dガード同期：3D側もBLOCKSTUNとGUARD RECOVERYを別状態として扱い、BLOCKSTUN中は移動・攻撃・再ガードをロックし、HUDのフレーム有利不利と実際の入力可能タイミングを一致させる
- 3D CPU難度：EASYは反撃を行わず、NORMALは一定確率で空振り／ガード後隙を咎め、HARDはそれらを優先して反撃する。難度はキャラクター性能ではなく、反応・保持ガード・反撃判断へ影響させる
- 3D試合完了：ベスト・オブ・3の最終結果をLOCAL ONLYのMATCH REPORTへ渡し、FIGHT LOGを残したままREMATCHまたはBACK TO 2Dを選べる。リセット時は結果カードとログを初期化する
- 3Dトレーニング：3D TRAINING中はCPUを停止したダミーに切り替え、立ちガード／しゃがみガードを固定できる。ダミーがKOされても自動復帰し、BLOCKSTUN・投げ・LOW／OVERHEADの確認を中断しない。3D PUNISH DRILLではCPUのHEAVY空振り後RECOVERYを画面上で待ち受け、3D MIXUP DRILLではSTAND GUARD／CROUCH GUARD／OPEN・THROWを順番に切り替える
- 3D FRAME LAB：3D SHOWROOMのFRAME LABまたはFキーで、プレイヤー／CPUのHURTBOX、通常の攻撃判定、STARTUP／ACTIVE／RECOVERYを重ねて表示する。技の射程と攻撃タイミングを見ながら、2Dと同じく判定の調整と練習を行える
- CPU TELEGRAPH：EASY／NORMAL／HARDの通常攻撃は、難度別の予備時間を置いてCPU TELEGRAPHと技名を表示する。プレイヤーがその間に攻撃を始めるとCPUは攻撃を取り下げる。WHIFF／BLOCK PUNISH、対空、起き攻めの即応判断は別分岐として維持し、反応可能な通常攻撃と確定反撃を区別する
- 3D FIGHT LOG：3D画面内のLOCAL ONLYログに、CPU TELEGRAPH、HIT／BLOCK／COUNTER／PUNISH、THROW TECH、ラウンド／マッチ結果を最大40イベント保存する。直近8件は画面内で読み返せ、`window.LUNA_SHOWROOM.getFightLog()`からも検証できる。外部送信は行わない
- 起き上がり選択：ノックダウン中のWはQUICK RISE、A／Dは前後ROLLを選択し、短い投げ無敵と位置変化を得る。入力なしならAUTO起き上がりとし、WAKEUP_OPTIONをFIGHT LOGへ記録する
- 起き攻めの読み合い：CPUはKNOCKDOWN／QUICK RISE／BACK ROLL／FORWARD ROLL／AUTOを別のOKI_READとして記録し、QUICK RISEにはMEATY、ROLLにはCHASE／CHECKを選んでHUDとFIGHT LOGに表示する
- ゲージはSPECIAL／OVERDRIVEだけでなくDRIVE BURSTにも使うため、攻めと守りの判断が生まれる
- CPU難度：EASYは予兆と間を長く、NORMALは標準反応、HARDは通常の思考タイマーを待たず空振り後・危険なガード後隙の反撃判断を優先する。対象攻撃をロックし、同じ空振りを重複してPUNISHしない。NORMAL／HARDは攻撃の種類を見てLOW GUARD、OVERHEAD GUARD、THROW AVOID、THROW TECH、BLOCK PUNISHを選び、HUDに理由を残す

## ビジュアル強化

- 背景：東京の昼のクリエイティブスタジオを生成し、Canvasのステージ背景に採用
- ルナ：太陽を手のひらに持つフルボディ画像を、戦闘キャラクターとして採用
- ネコムシカ：紫の音波リングを放つフルボディ画像を、ライバルキャラクターとして採用
- 必殺技：画像側の太陽／音波に加えて、Canvas側の発光、放射線、画面フラッシュ、ヒットストップを重ねる
- 共通演出：立ち絵に待機時の呼吸、歩行のステップ、ダッシュの伸縮・残像、攻撃の溜め／踏み込み／戻り、被弾の反り、ガード、PARRY、BURSTの姿勢変化をCanvasで重ねる
- 技演出：10人それぞれに太陽、音波、風、炎、星、磁力などの投射体グリフを割り当てる
- 音響：外部ファイルに依存せず、Web Audioで選択・打撃・ガード・必殺技・勝敗の短いフィードバックを生成する
- 対戦UI：ラウンド勝利数をHUDのドットで常時表示し、Pキー／PAUSEで試合を止められる
- 拡散導線：リザルトから勝者・GRADE・最大コンボを一文にして共有／コピーする
- 操作感：2Dは攻撃・硬直中の入力を0.2秒だけ保持し、3DもINPUT BUFFERでLIGHT→派生通常技→SPECIALとSPECIAL CANCELへつなげる。2Dの通常入力はキャラクターごとにCOMBO ROUTEを変え、LUNAはJ→K、NEKOMUSICAはJ→LOW、VANTAはJ→OVERHEAD、PIKOはJからLOW／OVERHEADへ分岐する。空振りからの連携は成立させない。3Dコンボは2発目以降に段階的なprorationを適用し、HUDへ補正率を表示する
- 固有通常技：KAGARIのJは前進するSOLAR STEP、MIZUKIのNは飛び道具PHASE LOW、BOLT-9のKはアーマー付きMAGNET HEAVY、PIKOのMは前進するBOUNCE OVERHEAD、ORBISのMは相手の背後へ移るORBIT SHIFTとする。キャラクターを選ぶ理由を、ステータス表だけでなく接触時の操作感で作る
- 固有技描画：KAGARI／MIZUKI／BOLT-9／PIKO／ORBISの固有通常技は`signature`を持ち、攻撃中に専用の軌跡・輪郭・磁力・音波・星エフェクトをCanvasで描画する。汎用攻撃弧は残しつつ、固有技の役割が一目で分かる二重フィードバックにする
- 選択体験：カード選択中に役割・SPECIAL・OVERDRIVEを即時表示し、対戦前にキャラの個性を理解できる
- FRAME LAB：トレーニング中に自分とCPUのヒットボックス、攻撃判定、STARTUP／ACTIVE／RECOVERYを重ねて表示する
- ROUTE LAB：キャラ固有の基本連携、攻撃中の次ルート、入力バッファ、CHAIN／SPECIAL CANCEL成立をHUDへ即時表示する
- コンボ補正：2発目以降のヒットに`1 - 0.08 × 現在コンボ数`の補正を適用し、下限55%。BLOCKでコンボを切り、補正を100%へ戻す
- アーケード進行：9人のルートを進み、勝利ごとにDAY SHARDS、RUN SCORE、一部ゲージ持ち越しを発生させる
- 継続記録：勝利、敗北、最高コンボ、アーケード制覇、累積SHARDSをlocalStorageへ保存する
- 勝利演出：キャラクターごとの短い勝利文、DAY CLEARシール、次の対戦先を表示する
- 3D SHOWROOM：WebGLによる10人のプロシージャル3Dエージェント、ドラッグ視点、移動、攻撃、CPU反撃、ガード、硬直、押し合い、HP、勝敗演出を追加する。ニュートラルは自由なSHOWROOM ORBIT、戦闘中は攻撃・硬直・起き上がり・ラウンド結果を検知してSIDE VIEWへカメラをロックし、プレイヤーとCPUの距離に応じて画角を引く。10人それぞれにSPECIALの役割を持たせ、RUSH／TRAP／WAVE／ARMOR／BURST／BOUNCE／ORBITなど、射程・移動・アーマー・位置変化・演出が同じにならないようにする。COUNTER／PUNISH COUNTERも2Dと同じ基準で分類する。HEAVY／SPECIAL／THROWは接触後にノックダウンへつながり、3D上でも倒れ姿勢を表示する。ノックダウン中のWはQUICK RISE、A／DはROLLとし、CPU OKIの読みを表示する。ヒット時は結果別のヒットストップ、技別の攻撃ポーズ、Web Audio音響、画面揺れ、エフェクトを重ねる。連続ヒットはキャラごとのCOMBO ROUTEに沿ってLIGHT→派生通常技→SPECIALへつなぎ、コンボ数に応じて最大55%までダメージを補正する。HIT／BLOCK／COUNTER／PUNISHの接触時は残り硬直からフレーム有利不利を計算し、YOU／CPU双方へ表示する。BLOCK後はガード後隙を別タイマーで管理し、フレーム表示と実際の攻撃受付を一致させる。CPU防御は攻撃受付窓で一度読みを決め、立ち／しゃがみガードを一定時間保持して、偶然の点滅ではなく観測可能な判断として返す
- 3D版は追加課金なし。外部API・APIキー・決済処理を持たない静的ブラウザ実装とする。ROUND開始時は2Dと同じくREADY中の入力・CPU行動をロックし、FIGHT表示後にニュートラルへ入る。SPECIALは100 DRIVEゲージ中25を消費し、ゲージ不足時はNEED DRIVEで発動しない。コンボ中のSPECIAL CANCELも同じ資源条件を使う。キーボード入力後はROUND READYやNEED DRIVEなどの結果表示を入力ハンドラが上書きしない。通常時のWはジャンプ、空中のJ／Kは空中攻撃としてAIR LIGHT／AIR HEAVYを表示し、空中のLOW／THROWは回避される。Kは対空属性を持ち、空中相手へ強化ダメージとノックダウンを与える。CPUもプレイヤーの空中状態を読み、対空Kを返す
- FIGHT LOG：1試合のイベントをローカルメモリに記録し、COMBAT／THROW TECH／OKI READを発生フレーム、攻撃フェーズ、プレイヤー視点の有利不利付きで結果画面から再確認する
- 反撃判定：被弾側がSTARTUP中ならCOUNTER、ACTIVE後のRECOVERY中ならPUNISH。PUNISHはダメージ1.18倍・硬直+120ms、COUNTERは硬直+60msとし、結果画面でも区別する
- 反撃演出：COUNTER／PUNISHは通常ヒットと音響、スパーク量、画面揺れ、チップメッセージを分け、成立後のコンボ受付と起き攻めの判断を伝える
- PUNISH DRILL：TRAINING MODE限定でCPUのHEAVY空振り後RECOVERYを反復する。ドリル中だけ受付猶予を約3秒に延長し、PUNISH成立後の追撃まで練習できる。通常対戦の硬直時間は変更しない
- MIXUP DRILL：TRAINING MODE限定でCPUがSTAND GUARD／CROUCH GUARD／OPEN・THROWを約2.25秒ごとに切り替える。LOW・OVERHEAD・THROWの成立条件を画面表示とチップ文で確認でき、PUNISH DRILLとは同時に動かさない
- CHARACTER TRIAL：TRAINING MODE限定で選択キャラ固有の勝ち筋を2〜3段階の入力課題にする。期待順をtrainingNoteとTRIAL HUDに表示し、正しいHIT／COUNTER／PUNISHで進行、誤入力で先頭へ戻る。CLEAR後はRで再挑戦でき、キャラを変える理由を練習体験として伝える

## キャラクターロスター

| キャラクター | 役割 | 強み | 得意技 |
|---|---|---|---|
| LUNA | BALANCED | 全体の扱いやすさ | DAYBREAK / LUNA OVERDRIVE |
| NEKOMUSICA | TRICKSTER | 速度・射程・音波 | GLITCH WAVE / RULE OVERRIDE |
| KAGARI | RUSHDOWN | 最高速・接近戦 | SOLAR RUSH / SUNSET BREAK |
| MIZUKI | ZONER | 射程・空間支配 | PHASE NOTE / CRESCENDO NULL |
| BOLT-9 | TANK | 体力・防御・重量攻撃 | MAGNET PUNCH / CORE OVERLOAD |
| VANTA | POWER | 魔力・単発火力 | HEX BURST / ABYSSAL SCRIPT |
| SYLFA | WIND | 空中機動・長射程 | WIND VEIL / VERDANT ARIA |
| RYUGA | DRAGON | 体力・正面突破 | DRAGON FLARE / RED COMET |
| PIKO | CHAOS | 跳躍・予測不能な弾道 | BOUNCE BLOB / JELLY JAM |
| ORBIS | COSMIC | 星片・軌道制御 | ORBIT LANCE / ECLIPSE LOOP |

キャラクター選択画面はYOU／CPUの対象を切り替えてカードを選ぶ方式。次のキャラ追加は、プロフィール、立ち絵、技チューニングを1セットで登録する。

## 今後の拡張順

1. キャラクター固有の挑発・勝利ポーズ・イントロを追加する
2. ルナの追加必殺技と、ネコムシカ固有の音波技を追加する
3. 追加キャラクター「サン・ルナ」「ミッドナイト・ルナ」を投票で決める
4. 対戦結果をXへ共有する画像カードを追加する
5. GitHub Pagesで公開し、noteに技設計の裏側を記録する

## 完成条件

- ブラウザだけで起動できる
- VS CPUとトレーニングモードを遊べる
- 勝敗、コンボ、ゲージ、必殺技が画面上で理解できる
- スマートフォンでも最低限の操作ができる
- 公開URLと次の改善点が運用台帳に記録される
- キャラクター名を固定せず、選択した10人の勝敗・必殺技・結果表示が一貫している
- `smoke-test.mjs`でロスター、選択、固有技、投射体、OVERDRIVE、一時停止、FRAME LABを再検証できる
- `showroom3d.js`でWebGLコンテキスト、3Dアリーナ、10人ロスター、カメラ操作の入口を維持できる
- 10人全員に固有通常技を持たせ、2D Canvasと3D WebGLで同じ役割差を表示する。LUNA＝SUN PUNCH、NEKOMUSICA＝GLITCH CLAW、VANTA＝HEX MARK、SYLFA＝WIND SLICE、RYUGA＝DRAGON CRUSHを追加し、既存5人の固有技と合わせて全員の操作感を分ける
