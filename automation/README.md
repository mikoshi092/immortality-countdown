# Phase 3.0 — Automation Spine

収集元に Nature News RSS を追加。AI×生命科学、新研究施設、遺伝子編集、再生医療、がん治療の具体的な動きを `science-news` として扱う。論文とは別に Evidence E・科学ニュース報道と明記し、人体での効果や寿命延長を掲載の必須条件にしない。RSS要約が短すぎる場合は held。元記事の未解明事項を日英で維持し、カウントダウンへの影響は none。過去48時間より古い記事の自動遡及掲載はしない。

PubMed と ClinicalTrials.gov から直近48時間の記録を集め、正規化・重複排除・分類評価・検証まで行う。記事の自動公開は Phase 3.1 の `news:publish` と `.github/workflows/news-auto-publish.yml` が行い、この ingest 自体は `lev/params.json` と `lev/forecast.json` を書かない。

```
npm run ingest:dry
```

出力は `automation/output/candidates.json`。このファイルは git 管理対象外。

## 件数の意味

| 件数 | 意味 |
| --- | --- |
| Fetched | 取得アダプターが返した生レコード数。取得失敗は「新着0件」にしない。`sourceResults[].status` は `ok` / `partial` / `failed`。部分失敗でも取得済みは残し、CLI は非ゼロ終了する。 |
| Deduplicated | DOI（優先）または canonical URL で統合したユニーク件数。片方だけ DOI がある同一 URL も統合する。入力順を変えても結果は同じ。DOI が矛盾する同一 URL は統合せず `dedupConflicts` に残す。 |
| Relevant | 検証を通り、かつ `relevance >= 50` かつ `significance >= 30` の候補。 |
| Rejected | 該当しなかったレコード。理由は `rejected[].reasons`。 |

スコアは説明可能な初期ルールによる振り分けであり、科学的に校正された指標ではない。

## 48時間ウィンドウ

対象は実行時刻から遡って48時間。論文の公開日と索引追加日、試験の初回公開日と更新日は別フィールドとして保存し、混ぜない。各日付はソースが示した精度（datetime / day / month / year）を保持する。ISO の真夜中に変換してから再解析しない。

- datetime は明示タイムゾーンがあれば UTC に直して正確な時刻で比較する。タイムゾーンが無い場合は UTC として比較し、タイムゾーンを主張しない。
- day はその UTC 暦日が対象期間と重なるかで判定する。
- month / year だけでは期間内と確定しない。
- 存在しない暦日（例: 2月31日）は拒否する。

### PubMed（NCBI E-utilities）

公式ベース URL は Source Registry（`automation/sources.ts`）の `api.baseUrl` に置く。`fetchEnabledSources` は `enabledSources()` だけを呼ぶ。無効な取得元には HTTP リクエストを送らない。

- 検索: `esearch.fcgi`（`retmode=json`）。`datetype=edat`（Entrez Date / Date - Entry。索引追加日）と `datetype=pdat`（Publication Date。公開日）を別リクエストで取る。
- 要約: `esummary.fcgi`（`retmode=json`）
- 抄録: `efetch.fcgi`（`retmode=xml`、PubMed XML DTD）

ESearch の `reldate` は日単位なので、48時間の近似として `mindate`/`maxdate` に UTC 日付（YYYY/MM/DD）を渡す。その後、取得した日付の精度に応じてクライアント側で判定する。

- Entrez history の `YYYY/MM/DD HH:MM` は datetime として厳密に48時間判定する。
- 日精度の日付は、その UTC 日付がウィンドウの開始日〜終了日に重なれば対象。
- 月・年だけの公開日は、48時間に入るか判断できないので、公開日としては対象にしない。索引日時があればそちらで判定する。

PubMed ESearch は一致件数の先頭 10,000 件まで。超えた場合は `truncated` を立てる。`retstart`/`retmax` でページングする。リクエスト間隔は API キーなしで 3 リクエスト/秒を超えないよう約 350ms 空ける。タイムアウトは 25 秒。HTTP エラーはソース失敗として記録する。抄録 HTTP 失敗は `pubTypes` に埋め込まず、`issues` に `abstract-fetch-failed` として出す。XML 上もともと抄録が無い場合は `abstract-missing-in-source` であり、通信失敗ではない。部分失敗時は取得済みレコードを残し、`status=partial` で CLI を非ゼロ終了する。

レコード URL は API が記事ページを返さないため、PubMed アダプター内だけで PMID から `https://pubmed.ncbi.nlm.nih.gov/{pmid}/` を構成する。由来は `urlOrigin` に残す。評価処理では URL も DOI も作らない。

### ClinicalTrials.gov Data API v2

公式ベース URL は Source Registry の `api.baseUrl`（`https://clinicaltrials.gov/api/v2/studies`）。

- 検索: `GET /studies`（確認した API 版は 2.0.5）
- ページング: 応答の `nextPageToken` を次リクエストの `pageToken` に渡す。`pageSize` 上限は 1,000。
- 日付: Essie の `AREA[StudyFirstPostDate]RANGE[from,to]` と `AREA[LastUpdatePostDate]RANGE[from,to]` を別検索する。
- フィールド例: `NCTId`, `BriefTitle`, `StudyFirstPostDate`, `LastUpdatePostDate`, `OverallStatus`, `BriefSummary`, `StudyType`, `Phase`, `HasResults`

試験日付は YYYY-MM-DD のカレンダー日付で、時刻はない。48時間は UTC の直近2カレンダー日として検索し、`studyFirstPostDate` と `lastUpdatePostDate` を別々に判定する。初回公開日が古く、更新日だけがウィンドウ内、という場合は更新日ヒットとして残し、`publishedAt` は初回公開日のままにする。

レコード URL は NCT ID から `https://clinicaltrials.gov/study/{nctId}` をアダプター内だけで構成する。

## 分類と Evidence

正式8分野（`lib/fields.ts` の FieldId）へ、タイトル・抄録の説明可能なキーワードで分類する。

Evidence は `data/news.ts` の定義を再利用する。タイトルだけでなく抄録の対象・方法を見る。「human」という語だけでは C に上げない。

- 試験登録や更新だけで、人での有効性が実証されたとは扱わない → Evidence E
- がん治療の研究も候補に含める。登録試験は試験活動、論文結果は実際に測定された腫瘍反応・生存などとして区別する。動物・細胞結果を人の治療効果に言い換えない。
- 結果掲載があっても、研究デザインを推測して A/B には上げない → 最大 Evidence C
- ヒト由来でも、培養細胞・組織・オルガノイド・in vitro が実験系なら → Evidence D
- 動物実験 → Evidence D
- 生きている人を対象にした観察・試験（cohort、participants、NHANES など）→ Evidence C
- systematic review / meta-analysis は語だけで一律に下げない。対象がヒト研究なら C、細胞・動物なら D、対象が読めなければ根拠不足として E
- 情報不足なら、分類根拠が不十分であることを reason に残して E
- Evidence A/B は自動では付けない

### 試験の重要度（Evidence とは別）

全体の閾値（relevance >= 50、significance >= 30）は、関連性のある研究を広く拾うための運用フィルターである。正確性・Evidence・試験登録と結果の区別は別ゲートとして維持する。

試験の significance は有効性ではなく、取得できたレジストリ項目に基づく活動度である。

使う項目:

- `studyType`（INTERVENTIONAL / OBSERVATIONAL など）
- `phases`（PHASE1–4。スナップショット上の現在値）
- `OverallStatus`（例: RECRUITING）
- `StudyFirstPostDate` がウィンドウ内か（新規の公開登録）
- `LastUpdatePostDate` がウィンドウ内か
- `hasResults`

使わない・主張しないこと:

- 更新日だけでは「段階移行」と書かない。API の1回のスナップショットには以前の相がない
- 初回公開がウィンドウ外で、status が RECRUITING なだけでは「この48時間に募集開始」と書かない

新規に公開された介入試験（とくに Phase 2 以降）は、登録だからという理由だけで必ず閾値未満にはしない。ただし Evidence は E のまま。

### 論文の重要度（修正前 → 修正後）

修正前は Evidence で点が固定されていた。

| Evidence | 修正前の significance |
| --- | --- |
| C | 50（人を対象というだけで固定） |
| D | 30（必ず閾値未満） |
| E | 25 |

これでは重要なマウス寿命研究も、細胞プロファイリングも同じ D=30 で落ちる。C の観察研究は中身に関係なく 50 になる。

修正後は Evidence を見ない。確認できる記載だけを足す。効果量・新規性・因果は推測しない。語があるだけでは成果と見なさない。変化の動詞と評価項目が**同じ文**にあるときだけ見る。80文字以内の近接だけでは加点しない。

判定できない場合は成果点を保留し、理由を残して手動確認へ回す。

| 項目 | 点 | 条件 |
| --- | --- | --- |
| 基準 | 20 | 全論文 |
| 長寿への直接性 | +12 または +6 | タイトルに lifespan/healthspan/longevity/geroscience なら +12。aging/senescence/clock なら +6。どちらか一方 |
| 介入 | +8 | treated with / administered / overexpression など、この研究で介入した記載 |
| 報告された変化（一方のみ） | +18 / +12 / +3 | 個体の寿命変化 +18。個体の機能変化 +12。老化指標・細胞老化の変化 +3。細胞 survival・疾患別 survival・背景の既報・目的/仮説/予定・否定/非有意は加点しない |
| デザイン（一方のみ） | +8 / +5 / +3 | randomized/placebo-controlled +8。compared with/control +5。人を対象にした associated with などの観察関連 +3。細胞論文の “associated with” だけでは加点しない |
| レビュー | +6 | 合成であることの加点。引用元の寿命結果は、この論文の実験としては加点しない |

研究対象は読み取れた範囲で複数記録する（例: cells-tissues-organoids, mice, minipigs）。Evidence D でも細胞だけと断定しない。

例: 老齢マウスに senolytic を投与し median lifespan was extended compared with vehicle → D のまま 20+12+8+18+5 で 40 以上になり得る。  
例: in vitro の継代 MSC のトランスクリプトームだけ → D でも 20+6 程度で不採用。  
例: NHANES で clock と疾患が associated with → C でも 20+6+3 程度。C だから 50 にはしない。

## モデル保護

このパイプラインは `lev/params.json` と `lev/forecast.json` を読んでも書かない。実行前後で両ファイルの内容が変わらないことをテストする。

## 環境変数

値はコードに書かない。変数名だけ `.env.example` にある。

- `NCBI_API_KEY` — 任意。E-utilities のレート上限を上げる
- `NCBI_EMAIL` — 任意。NCBI が推奨する連絡先
- `NCBI_TOOL` — 任意。未設定時は `immortality-countdown`
- `OPENAI_API_KEY` — 記事生成（OpenAI）に必須
- `EDITORIAL_MODEL` — 任意。未設定時は `gpt-4o-mini`
- `EDITORIAL_PROVIDER` — 任意。`openai`（既定）またはテスト用 `mock`
- `NEWS_PUBLISH_TOKEN` — fine-grained PAT。対象は immortality-countdown だけ。Contents は Read and write、Pull requests は Read and write、Metadata は Read。Administration なし。Actions の書き込みなし。rules bypass なし。有効期限あり。

## GitHub Actions

`.github/workflows/news-auto-publish.yml` は 6 時間ごとと `workflow_dispatch` で、open PR の確認 → ingest → editorial → 公開ゲート → `data/articles.ts` だけを変更 → 記事専用ブランチと PR → required checks 成功後の auto-merge まで行う。`main` へ直接 push しない。同時実行は `concurrency: news-auto-publish` で防ぐ。`news/auto-*` または label `news-auto` の open PR があるあいだは次の PR を作らない。24時間を超えた自動ニュース PR は auto-merge せず、閉じられる。ブランチ名には `GITHUB_RUN_ID` と `GITHUB_RUN_ATTEMPT` を含める。checkout は `persist-credentials: false`。

必要な GitHub secrets / vars:

- `NCBI_API_KEY` / `NCBI_EMAIL` — PubMed
- `OPENAI_API_KEY` / `EDITORIAL_MODEL` — 記事生成
- `NEWS_PUBLISH_TOKEN` — fine-grained PAT。対象リポジトリは immortality-countdown のみ。Contents: Read and write。Pull requests: Read and write。Metadata: Read。Administration 権限なし。Actions の書き込み権限なし。rules bypass なし。有効期限あり。`GITHUB_TOKEN` の PR は checks を再トリガーしない。

`production-deploy-notice.yml` のトリガーは GitHub の `deployment_status` だけである。`workflow_run` でも Vercel Check のポーリングでもない。このリポジトリの Vercel Production 失敗が実際にそのイベントへ届くかは検証未完了。自動 revert はしない。

`.github/workflows/model-review.yml` は半年ごと（1月1日・7月1日 UTC）と手動。公開済み記事を根拠候補として出す。auto-merge しない。`lev/params.json` / `lev/forecast.json` は書かない。

## 既知の制約

- 採点は文単位のルールであり、誤判定は残る。全文理解や LLM による判定ではない。
- 取得途中のページ／バッチ失敗で、それまでの取得分を保持できない経路が残る。
- 判定不能は held にし、AI の推測で埋めない。
- `sitePublishedAt` は記事ファイル生成時の掲載予定時刻である。required checks と merge の遅延は許容する。

## Phase 3.1 — 日英記事と自動公開

```
npm run ingest:dry
npm run editorial:dry
npm run news:publish
```

`editorial:dry` は記事ファイルを書かない。`news:publish` はゲートを通ったドラフトだけ `data/articles.ts` に足し、`sitePublishedAt` に掲載予定時刻を入れる。LEV ファイルは書かない。

編集方針は `docs/editorial-policy.md`。ニュース更新と LEV モデル更新は分離する。
