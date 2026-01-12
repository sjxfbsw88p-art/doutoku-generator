import React, { useMemo, useState } from "react";

/**
 * ✅ ここに「r6_materials.json」の中身を貼る（推奨）
 * 例：{ "1": ["ありがとう","..."], "2": ["大きく なったね", ...], ... }
 *
 * そのまま貼れるように、JSONのキーが数字でも文字でもOKにしてあります。
 */
const MATERIALS_JSON = {
  // ★ここに r6_materials.json をコピペして上書きしてください★
  1: ["ありがとう", "ふたりの ゆうた", "なかよし", "あとかたづけ", "どうしてかな", "つばめ", "ひむかかるた", "花の かんむり"],
  2: ["大きく なったね", "金の おの", "がんばって", "ぽんたと かんた", "一りん車", "がまんできなくて", "ぎおんまつり", "あぶないよ", "ねえ、聞いて", "きつねと ぶどう", "わりこみ", "お月さまと コロ", "やくそく", "くりの み", "ぐみの木と 小鳥", "七つの 星"],
  3: ["やさしさのバトン", "さと子の落とし物", "心をしずめて", "ふろしき", "同じ小学校でも", "あの日のこと", "バスの中で", "水族館ではたらく", "助かった命", "これ、全部東京産", "光の星"],
  4: ["花さき山", "とびらの前で", "新次のしょうぎ", "雨ととの様", "朝がくると", "三つのつつみ", "かわいそうなぞう"],
  5: ["あいさつの心", "恩返しを", "サタデーグループ", "古いバケツ", "和太鼓調べ", "ことばのカタチ", "折れたタワー", "父の仕事", "流行おくれ", "これって不公平？", "かぜのでんわ"],
  6: ["言葉のおくりもの", "命のアサガオ", "先着100名様", "8 カスミと携帯電話", "おかげさまで", "ロレンゾの友達", "青の洞門", "最後のおくり物", "消えた本"],
};

/**
 * ✅ 教材マスタ（任意）
 * ここに domain / theme / aim が入っている教材は、より精度が上がります。
 * 入っていない教材は「自動推定」で aim / theme を作ります。
 *
 * まずは最小限だけ入れておき、必要に応じて増やしてOK。
 */
const LESSONS_MASTER = [
  // 例：2年
  { grade: 2, title: "大きく なったね", domain: "D", theme: "生命の尊さ", aim: "" },
  { grade: 2, title: "金の おの", domain: "A", theme: "正直、誠実", aim: "" },
  { grade: 2, title: "がんばって", domain: "C", theme: "勤労、公共の精神", aim: "" },
  { grade: 2, title: "ぽんたと かんた", domain: "A", theme: "善悪の判断・自律", aim: "" },
  { grade: 2, title: "一りん車", domain: "C", theme: "規則の尊重", aim: "" },
  { grade: 2, title: "がまんできなくて", domain: "A", theme: "節度、節制", aim: "" },
  { grade: 2, title: "ぎおんまつり", domain: "C", theme: "国や郷土を愛する", aim: "" },
  { grade: 2, title: "あぶないよ", domain: "A", theme: "節度、節制（安全）", aim: "" },
  { grade: 2, title: "ねえ、聞いて", domain: "B", theme: "友情、信頼", aim: "" },
  { grade: 2, title: "きつねと ぶどう", domain: "B", theme: "感謝", aim: "" },
  { grade: 2, title: "わりこみ", domain: "A", theme: "善悪の判断", aim: "" },
  { grade: 2, title: "お月さまと コロ", domain: "A", theme: "正直、誠実", aim: "" },
  { grade: 2, title: "やくそく", domain: "D", theme: "生命の尊さ", aim: "" },
  { grade: 2, title: "くりの み", domain: "B", theme: "親切、思いやり", aim: "" },
  { grade: 2, title: "ぐみの木と 小鳥", domain: "B", theme: "親切、思いやり", aim: "" },
  { grade: 2, title: "七つの 星", domain: "D", theme: "感動、畏敬の念", aim: "" },
];

// ====== 固定ルール ======
const MIN_CHARS = 110;
const MAX_CHARS = 120;

const NG_PHRASES = [
  "見られました",
  "理解することができました",
  "理解を深めることができました",
  "心情が育ちました",
  "守ることができました",
  "高めることができました",
];

// 文字数（空白除外）
function countChars(str) {
  return (str || "").replace(/\s/g, "").length;
}

// NG表現の回避
function sanitize(text) {
  let out = text || "";
  out = out.replaceAll("見られました", "思いを深めました");
  out = out.replaceAll("理解することができました", "考えを深めました");
  out = out.replaceAll("理解を深めることができました", "考えを深めました");
  out = out.replaceAll("心情が育ちました", "思いを深めました");
  out = out.replaceAll("守ることができました", "大切にしようとする思いを深めました");
  out = out.replaceAll("高めることができました", "思いを深めました");
  for (const ng of NG_PHRASES) out = out.replaceAll(ng, "");
  return out;
}

// 字数調整（110〜120へ）
function adjustToRange(text, minChars, maxChars) {
  const fillers = [
    "理由を確かめながら",
    "自分の生活を振り返りながら",
    "友達の考えも聞きながら",
    "感じたことを出し合って",
    "多面的に捉えながら",
  ];

  const compressRules = [
    [/改めて/g, ""],
    [/丁寧に/g, ""],
    [/じっくり/g, ""],
    [/しっかり/g, ""],
    [/\s+/g, ""],
  ];

  let out = text || "";

  // 長い場合は圧縮
  for (const [re, rep] of compressRules) {
    if (countChars(out) <= maxChars) break;
    out = out.replace(re, rep);
  }

  // 短い場合は2文目に補助句を挿入
  let guard = 0;
  while (countChars(out) < minChars && guard < 12) {
    const f = fillers[guard % fillers.length];
    out = out.replace("話し合いました。", `${f}話し合いました。`);
    guard++;
  }

  // まだ短い場合は1文目にも補助句
  guard = 0;
  while (countChars(out) < minChars && guard < 6) {
    const f = fillers[(guard + 2) % fillers.length];
    out = out.replace("考えました。", `${f}考えました。`);
    guard++;
  }

  // まだ長い場合は補助句を戻す
  if (countChars(out) > maxChars) {
    for (const f of fillers) {
      if (countChars(out) <= maxChars) break;
      out = out.replace(f, "");
    }
  }
  return out;
}

function normalizeTitle(t) {
  return (t || "")
    .replace(/\s+/g, "")
    .replace(/　/g, "")
    .replace(/^[0-9０-９]+/g, "")
    .replace(/^[‐\-–—ー]+/g, "");
}

function cleanTitle(t) {
  const raw = (t || "").trim();
  // 先頭の番号っぽいもの除去（例: "8 カスミと携帯電話" は残したいので、数字+スペースは残す）
  // ただし "13 学級しょうかい" のようなものはタイトルとして使ってもOKなのでそのまま。
  return raw.replace(/\s{2,}/g, " ").trim();
}

// domain/theme がない教材でも「それっぽく」推定する
function inferDomainTheme(title) {
  const t = normalizeTitle(title);

  // 超ざっくり辞書（増やしてOK）
  const rules = [
    { k: ["ありがとう", "おかげ", "恩返し"], domain: "B", theme: "感謝" },
    { k: ["あいさつ", "礼儀", "聞いて"], domain: "B", theme: "礼儀" },
    { k: ["友", "なかよし", "ロレンゾ", "信頼", "バトン"], domain: "B", theme: "友情、信頼" },
    { k: ["親切", "思いやり", "くり", "とびら"], domain: "B", theme: "親切、思いやり" },
    { k: ["きまり", "規則", "先着", "消えた本", "一りん車"], domain: "C", theme: "規則の尊重" },
    { k: ["郷土", "まつり", "和太鼓", "ふろしき"], domain: "C", theme: "国や郷土を愛する" },
    { k: ["公", "不公平", "公平"], domain: "C", theme: "公正、公平" },
    { k: ["係", "仕事", "はたらく", "サタデー", "父の仕事"], domain: "C", theme: "勤労、公共の精神" },
    { k: ["命", "生命", "アサガオ", "かわいそうなぞう", "大きく"], domain: "D", theme: "生命の尊さ" },
    { k: ["自然", "つばめ", "星", "洞門"], domain: "D", theme: "自然愛護／感動、畏敬の念" },
    { k: ["正直", "斧", "しょうぎ"], domain: "A", theme: "正直、誠実" },
    { k: ["がまん", "節度", "流行", "ながら"], domain: "A", theme: "節度、節制" },
  ];

  for (const r of rules) {
    if (r.k.some((kw) => t.includes(normalizeTitle(kw)))) return { domain: r.domain, theme: r.theme };
  }
  // 迷ったら汎用
  return { domain: "B", theme: "よりよい生き方" };
}

// aim（ねらい）を「それっぽく」自動生成（全学年対応）
function deriveAim({ grade, domain, theme }) {
  const g = Number(grade || 0);

  // 学年によって表現をほんの少し変える
  const level = g <= 2 ? "気づき、" : g <= 4 ? "理解し、" : "自覚し、";

  const map = {
    A: {
      "正直、誠実": `正直に行動するよさに${level}自分の言動を見つめて正しい選択をしようとする。`,
      "節度、節制": `自分の気持ちや生活を整える大切さに${level}落ち着いて行動しようとする。`,
      "善悪の判断・自律": `よいこととよくないことを${level}自分で考えて判断し、行動を選ぼうとする。`,
      "善悪の判断": `してよいこと・いけないことを${level}自分で判断して行動しようとする。`,
      "個性の伸長": `自分や友達のよさに${level}互いを認めながら自信をもって行動しようとする。`,
      "自由と責任": `自由には責任が伴うことを${level}周りへの影響を考えて行動しようとする。`,
      "真理の探究": `物事を深く考える大切さに${level}理由を確かめながら学びを広げようとする。`,
    },
    B: {
      "感謝": `周りの支えや思いに${level}「ありがとう」を言葉や行動で伝えようとする。`,
      "礼儀": `場に合った言葉や態度の大切さに${level}相手を大切にして関わろうとする。`,
      "友情、信頼": `友達の思いを${level}互いに助け合い、信頼して関係を深めようとする。`,
      "親切、思いやり": `相手の立場に立って考えることを${level}進んで親切にしようとする。`,
      "相互理解、寛容": `考えの違いを認め合うことを${level}相手の気持ちに寄り添って関わろうとする。`,
    },
    C: {
      "規則の尊重": `きまりの意味を${level}みんなが安心して過ごせるように守って行動しようとする。`,
      "公正、公平": `立場や好き嫌いにとらわれず公平に接することを${level}誰にでも同じように関わろうとする。`,
      "勤労、公共の精神": `みんなのために働くことの大切さを${level}役割を果たして協力しようとする。`,
      "国や郷土を愛する": `地域のよさや伝統に${level}郷土に親しみ、関わりを大切にしようとする。`,
      "国際理解、国際親善": `文化や考え方の違いを${level}相手を尊重して仲よく関わろうとする。`,
      "正義の実現": `正しいことを行う難しさに${level}みんなのために勇気をもって行動しようとする。`,
      "よりよい学校生活": `よりよい集団づくりを${level}自分にできることを考えて行動しようとする。`,
      "家族愛、家庭生活の充実": `家族の支えや思いに${level}感謝し、役割を果たそうとする。`,
    },
    D: {
      "生命の尊さ": `命の大切さに${level}自分や周りの命を大事にしようとする。`,
      "自然愛護": `身近な自然や生き物に親しみ${level}命を大切にして関わろうとする。`,
      "感動、畏敬の念": `自然や物語に触れて感じたことを${level}心に残し、大切に受け止めようとする。`,
      "よりよく生きる喜び": `よりよく生きようとする思いを${level}自分の生活につなげて行動しようとする。`,
    },
  };

  // theme文字列から一番近いキーを探す（ゆるく）
  const bucket = map[domain] || map.B;
  const keys = Object.keys(bucket);
  const foundKey =
    keys.find((k) => (theme || "").includes(k)) ||
    keys.find((k) => normalizeTitle(theme).includes(normalizeTitle(k))) ||
    (domain === "D" ? "生命の尊さ" : domain === "C" ? "規則の尊重" : domain === "A" ? "善悪の判断・自律" : "親切、思いやり");

  return bucket[foundKey] || `よりよい生き方について${level}これからの生活に生かそうとする。`;
}

// 3文構成の骨格（所見）
function buildDraft({ title, theme, aim, keywords }, variant) {
  const pool = keywords?.length ? keywords : ["気持ち", "理由", "行動", "関わり", "自分事"];
  const kw = pool[variant % pool.length];

  const s1 = `「${title}」の学習では、${theme}に関わる大切さについて考えました。`;
  const s2 = `登場人物の気持ちを自分に置き換え、${kw}に着目しながら、感じたことを出し合って話し合いました。`;
  const s3 = `学習を通して、${aim}これからの生活に生かそうとする思いを深めました。`;
  return `${s1}${s2}${s3}`;
}

// MATERIALS_JSON + LESSONS_MASTER を統合して “全学年” の教材配列を作る
function buildLessonsAll() {
  const byKey = new Map();

  // 1) JSON（タイトル一覧）から作る
  const jsonKeys = Object.keys(MATERIALS_JSON || {});
  for (const k of jsonKeys) {
    const grade = Number(k);
    const titles = MATERIALS_JSON[k] || MATERIALS_JSON[grade] || [];
    for (const t of titles) {
      const title = cleanTitle(String(t));
      if (!title) continue;
      const key = `${grade}::${normalizeTitle(title)}`;
      if (!byKey.has(key)) {
        const { domain, theme } = inferDomainTheme(title);
        byKey.set(key, { grade, title, domain, theme, aim: "", keywords: [] });
      }
    }
  }

  // 2) マスタ（domain/theme/aimがある分）で上書き
  for (const m of LESSONS_MASTER) {
    const grade = Number(m.grade);
    const title = cleanTitle(m.title);
    const key = `${grade}::${normalizeTitle(title)}`;
    const base = byKey.get(key) || { grade, title };
    const domain = m.domain || base.domain || inferDomainTheme(title).domain;
    const theme = m.theme || base.theme || inferDomainTheme(title).theme;
    byKey.set(key, {
      grade,
      title,
      domain,
      theme,
      aim: m.aim || base.aim || "",
      keywords: m.keywords || base.keywords || [],
    });
  }

  // 3) aim が空のものは自動生成
  const out = Array.from(byKey.values()).map((l) => {
    const aim = (l.aim || "").trim() ? l.aim.trim() : deriveAim(l);
    const theme = (l.theme || "").trim() ? l.theme.trim() : inferDomainTheme(l.title).theme;
    const domain = (l.domain || "").trim() ? l.domain.trim() : inferDomainTheme(l.title).domain;
    const keywords =
      l.keywords?.length
        ? l.keywords
        : domain === "A"
        ? ["判断", "選択", "自分", "整える", "行動"]
        : domain === "B"
        ? ["気持ち", "思いやり", "関わり", "言葉", "相手"]
        : domain === "C"
        ? ["きまり", "協力", "役割", "みんな", "社会"]
        : ["命", "自然", "気づき", "大切", "つながり"];

    return { ...l, domain, theme, aim, keywords };
  });

  // 学年→タイトル順にソート
  out.sort((a, b) => (a.grade !== b.grade ? a.grade - b.grade : a.title.localeCompare(b.title, "ja")));
  return out;
}

export default function App() {
  const [grade, setGrade] = useState(2);
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(5);
  const [results, setResults] = useState([]);
  const [q, setQ] = useState("");

  const LESSONS_ALL = useMemo(() => buildLessonsAll(), []);

  const gradeLessons = useMemo(() => {
    const list = LESSONS_ALL.filter((l) => Number(l.grade) === Number(grade));
    const nq = normalizeTitle(q);
    if (!nq) return list;
    return list.filter((l) => normalizeTitle(l.title).includes(nq));
  }, [LESSONS_ALL, grade, q]);

  const selected = useMemo(() => {
    const n = normalizeTitle(title);
    return LESSONS_ALL.find((l) => Number(l.grade) === Number(grade) && normalizeTitle(l.title) === n) || null;
  }, [LESSONS_ALL, grade, title]);

  const generate = () => {
    if (!title.trim()) return;

    const base =
      selected ||
      (() => {
        const { domain, theme } = inferDomainTheme(title.trim());
        const tmp = { grade, title: title.trim(), domain, theme, aim: "" };
        return {
          ...tmp,
          aim: deriveAim(tmp),
          keywords:
            domain === "A"
              ? ["判断", "選択", "自分", "整える", "行動"]
              : domain === "B"
              ? ["気持ち", "思いやり", "関わり", "言葉", "相手"]
              : domain === "C"
              ? ["きまり", "協力", "役割", "みんな", "社会"]
              : ["命", "自然", "気づき", "大切", "つながり"],
        };
      })();

    const out = [];
    for (let i = 0; i < Math.min(10, Math.max(1, Number(count || 1))); i++) {
      let text = buildDraft(base, base.theme, base.aim, base.keywords, i);
      text = sanitize(text);
      text = adjustToRange(text, MIN_CHARS, MAX_CHARS);
      out.push(text);
    }
    setResults(out);
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    alert("コピーしました");
  };

  const wrapStyle = {
    maxWidth: 980,
    margin: "24px auto",
    padding: "0 16px",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif',
  };

  const card = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
  };

  const pad = { padding: 16 };

  const label = { fontSize: 12, color: "#374151", marginBottom: 6, display: "block" };
  const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 14,
  };

  const btn = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    cursor: "pointer",
    background: "#fff",
    fontWeight: 600,
  };

  const btnPrimary = { ...btn, background: "#111827", color: "#fff", border: "1px solid #111827" };

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>道徳所見ジェネレーター（{MIN_CHARS}〜{MAX_CHARS}字）</h1>
        <span
          style={{
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          全学年対応
        </span>
      </div>

      <div style={{ marginBottom: 12, fontSize: 13, color: "#374151" }}>
        <b>運用メモ：</b>児童名など個人情報は入力しないでください（教材ベースで生成します）。
      </div>

      <div style={card}>
        <div style={pad}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 220px", gap: 12 }}>
            <div>
              <label style={label}>学年</label>
              <select style={input} value={grade} onChange={(e) => { setGrade(Number(e.target.value)); setTitle(""); setResults([]); }}>
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    {g}年生
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                教材数：{LESSONS_ALL.filter((l) => Number(l.grade) === Number(grade)).length}件
              </div>
            </div>

            <div>
              <label style={label}>教材名（学年で絞り込み）</label>
              <input
                style={input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="候補から選ぶか、自由入力もOK"
                list="lesson-list"
              />
              <datalist id="lesson-list">
                {gradeLessons.slice(0, 200).map((l) => (
                  <option key={`${l.grade}-${l.title}`} value={l.title} />
                ))}
              </datalist>

              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  style={{ ...input, width: "55%" }}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="候補の検索（例：命 / まつり / 友だち）"
                />
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {selected ? (
                    <>
                      登録：<b>{selected.domain}</b> ／ {selected.theme} ／ <span>ねらい自動入力済み</span>
                    </>
                  ) : (
                    <>未登録教材：自動推定で生成します</>
                  )}
                </div>
              </div>

              {selected && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#374151" }}>
                  <b>ねらい（aim）：</b>
                  {selected.aim}
                </div>
              )}
            </div>

            <div>
              <label style={label}>出力本数（1〜10）</label>
              <input
                style={input}
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
              <div style={{ marginTop: 10 }}>
                <button style={{ ...btnPrimary, width: "100%" }} onClick={generate}>
                  所見を生成する
                </button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                字数は自動で{MIN_CHARS}〜{MAX_CHARS}字に調整します
              </div>
            </div>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {results.map((text, i) => (
            <div key={i} style={card}>
              <div style={pad}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>字数：{countChars(text)}</span>
                  <button style={btn} onClick={() => copyText(text)}>
                    コピー
                  </button>
                </div>
                <textarea
                  value={text}
                  readOnly
                  style={{
                    width: "100%",
                    height: 110,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    padding: 12,
                    fontSize: 14,
                    lineHeight: 1.7,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18, fontSize: 12, color: "#6b7280" }}>
        ※ aim（ねらい）は、教材データに入っていない場合でも domain / theme から自動生成します。<br />
        ※ もしテーマ推定がズレる教材があれば、LESSONS_MASTER に1行だけ追加すると一気に精度が上がります。
      </div>
    </div>
  );
}