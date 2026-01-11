import React, { useMemo, useState } from "react";

// ====== 教材マスタ（今ある範囲） ======
const LESSONS = [
  { title: "大きくなったね", domain: "D", theme: "生命の尊さ", aim: "自分の成長が生きている証であることに気づき、命を大切にしようとする。", keywords: ["成長","いのち","気づき","大切","家族"] },
  { title: "金の斧", domain: "A", theme: "正直・誠実", aim: "正直であることのよさに気づき、本当のことを言おうとする。", keywords: ["正直","本当","信頼","勇気","選択"] },
  { title: "ほんがかりさんがんばっているね", domain: "C", theme: "勤労・公共の精神", aim: "係活動を通して、みんなのために働くことの大切さに気づく。", keywords: ["係","責任","協力","役割","継続"] },
  { title: "ぽんたとかんた", domain: "A", theme: "善悪の判断・自律", aim: "迷いの中でも自分でよい判断をしようとする。", keywords: ["迷い","判断","勇気","約束","自分で決める"] },
  { title: "ありがとうっていわれたよ", domain: "B", theme: "親切・思いやり", aim: "人に親切にすることで生まれる温かい気持ちに気づく。", keywords: ["親切","思いやり","うれしさ","行動","気持ち"] },
  { title: "１輪車", domain: "C", theme: "規則の尊重", aim: "きまりを守ることが、みんなの安心につながることに気づく。", keywords: ["きまり","順番","安全","周り","配慮"] },
  { title: "がまんできなくて", domain: "A", theme: "節度・節制", aim: "感情に流されず、自分の気持ちを見つめて行動しようとする。", keywords: ["がまん","気持ち","調整","考える","落ち着く"] },
  { title: "虫が大好き", domain: "D", theme: "自然愛護", aim: "身近な生き物に親しみ、命を大切にしようとする。", keywords: ["自然","生き物","観察","やさしさ","尊重"] },
  { title: "３びきは友達", domain: "C", theme: "公正・公平", aim: "好き嫌いで態度を変えず、だれに対しても公平に接しようとする。", keywords: ["公平","態度","立場","えこひいき","気づき"] },
  { title: "およげないりすさん", domain: "B", theme: "友情・信頼", aim: "友達の立場に立って考え、助け合おうとする。", keywords: ["友達","思いやり","仲間","助け合い","気持ち"] },
  { title: "祇園祭", domain: "C", theme: "伝統と文化の尊重", aim: "地域の行事に親しみ、郷土を大切にしようとする。", keywords: ["地域","行事","伝統","誇り","関わり"] },
  { title: "タヒチからの友達", domain: "C", theme: "国際理解", aim: "異なる文化に親しみ、友達として関わろうとする。", keywords: ["文化","違い","交流","理解","友達"] },
  { title: "花火に込められた願い", domain: "C", theme: "郷土愛", aim: "地域の文化に込められた人々の思いに気づく。", keywords: ["願い","地域","伝統","気持ち","大切"] },
  { title: "危ないよ", domain: "A", theme: "節度・節制（安全）", aim: "危険を予想し、自分の身を守る行動をとろうとする。", keywords: ["安全","判断","危険","断る","守る"] },
  { title: "おじさんからの手紙", domain: "C", theme: "規則の尊重", aim: "公共の場での行動が周りの人の気持ちにつながることに気づく。", keywords: ["きまり","公共","配慮","マナー","気持ち"] },
  { title: "ねえ、聞いて", domain: "B", theme: "友情・信頼", aim: "友達の話を大切に聞くことの意味に気づく。", keywords: ["聞く","共感","友達","気持ち","関係"] },
  { title: "リエさんの良いところ", domain: "A", theme: "個性の伸長", aim: "自分や友達のよさに気づき、大切にしようとする。", keywords: ["良さ","自分","友達","認める","自信"] },

  { title: "狐と葡萄", domain: "B", theme: "感謝", aim: "家族や周りの人の思いに気づき、感謝しようとする。", keywords: ["家族","感謝","気づき","思い","ありがとう"] },
  { title: "割り込み", domain: "A", theme: "善悪の判断", aim: "してはいけないことに気づき、正しい行動を選ぼうとする。", keywords: ["順番","判断","勇気","正しさ","行動"] },
  { title: "お月様と ころ", domain: "A", theme: "正直・誠実", aim: "自分に素直になることの大切さに気づく。", keywords: ["素直","気持ち","正直","迷い","決心"] },
  { title: "お月様とコロ", domain: "A", theme: "正直・誠実", aim: "自分に素直になることの大切さに気づく。", keywords: ["素直","気持ち","正直","迷い","決心"] },
  { title: "さて、どうかな", domain: "B", theme: "礼儀", aim: "場に応じたあいさつや言葉遣いの大切さに気づく。", keywords: ["礼儀","あいさつ","言葉","相手","配慮"] },
  { title: "やくそく", domain: "D", theme: "生命の尊さ", aim: "多くの人に支えられている命の重さに気づく。", keywords: ["命","約束","支え","大切","気づき"] },
  { title: "おばあちゃんおげんきですか", domain: "C", theme: "家族愛", aim: "家族の思いに気づき、大切にしようとする。", keywords: ["家族","思い","手紙","つながり","大切"] },
  { title: "栗のみ", domain: "B", theme: "親切・思いやり", aim: "困っている人に心を寄せ、助けようとする。", keywords: ["親切","後悔","気づき","行動","思いやり"] },
  { title: "私たちの校歌", domain: "C", theme: "学校生活の充実", aim: "学校のよさに気づき、大切にしようとする。", keywords: ["学校","校歌","誇り","仲間","大切"] },
  { title: "決まりのない学校", domain: "C", theme: "規則の尊重", aim: "きまりの意味に気づき、守ろうとする。", keywords: ["きまり","自由","気づき","安心","生活"] },
  { title: "どうして泣いてるの", domain: "A", theme: "節度・節制（物やお金）", aim: "物やお金を大切にすることの意味に気づく。", keywords: ["物","大切","使い方","気づき","生活"] },
  { title: "ぐみの木と小鳥", domain: "D", theme: "自然愛護", aim: "自然の中で支え合う姿に気づき、命を大切にしようとする。", keywords: ["自然","支え合い","命","つながり","大切"] },
  { title: "ある日のくつばこで", domain: "B", theme: "友情・信頼", aim: "友達との関係の中で大切な行動について考える。", keywords: ["友達","関係","気持ち","行動","気づき"] },
  { title: "7つの星", domain: "C", theme: "伝統・文化", aim: "物語に込められた思いに触れ、大切に受け止めようとする。", keywords: ["物語","願い","思い","気づき","大切"] },
  { title: "七つの星", domain: "C", theme: "伝統・文化", aim: "物語に込められた思いに触れ、大切に受け止めようとする。", keywords: ["物語","願い","思い","気づき","大切"] },
  { title: "なまけにんじゃ", domain: "A", theme: "努力・自律", aim: "自分の生活を見つめ、めあてに向かって取り組もうとする。", keywords: ["努力","めあて","気づき","生活","継続"] },
  { title: "森のゆうびんやさん", domain: "C", theme: "勤労・公共の精神", aim: "役割を果たすことの大切さに気づく。", keywords: ["役割","責任","仕事","信頼","協力"] },
  { title: "ハッピーバースデー", domain: "B", theme: "友情・思いやり", aim: "相手の気持ちを考えた関わり方の大切さに気づく。", keywords: ["思いやり","気持ち","友達","配慮","関係"] },
  { title: "生きているから", domain: "D", theme: "生命の尊さ", aim: "生きていることそのものの価値に気づく。", keywords: ["命","生きる","大切","気づき","支え"] },
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
];

// 文字数（空白除外）
function countChars(str) {
  return str.replace(/\s/g, "").length;
}

// NG表現の回避
function sanitize(text) {
  let out = text;
  out = out.replaceAll("見られました", "思いを深めました");
  out = out.replaceAll("理解することができました", "考えを深めました");
  out = out.replaceAll("理解を深めることができました", "考えを深めました");
  out = out.replaceAll("心情が育ちました", "思いを深めました");
  out = out.replaceAll("守ることができました", "大切にしようとする思いを深めました");
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

  let out = text;

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

// 3文構成の骨格
function buildDraft({ title, theme, aim, keywords }, variant) {
  const kw = keywords?.[variant % (keywords?.length || 1)] || "";

  const s1 = `「${title}」の学習では、${theme}に関わる大切さについて考えました。`;
  const s2 = `登場人物の気持ちを自分に置き換え、${kw}に着目しながら、感じたことを出し合って話し合いました。`;
  const end = variant % 2 === 0 ? "思いを深めました。" : "思いを高めることができました。";
  const s3 = `学習を通して、${aim}と結び付けて、これからの生活に生かそうとする${end}`;
  return `${s1}${s2}${s3}`;
}

function normalizeTitle(t) {
  return t.replace(/\s+/g, "").replace(/　/g, "");
}

function getLesson(title) {
  const n = normalizeTitle(title);
  return LESSONS.find((l) => normalizeTitle(l.title) === n) || null;
}

// 表示用：候補
function suggestLessons(q) {
  const n = normalizeTitle(q);
  if (!n) return LESSONS.slice(0, 20);
  return LESSONS.filter((l) => normalizeTitle(l.title).includes(n)).slice(0, 20);
}

export default function App() {
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(5);
  const [results, setResults] = useState([]);

  const lesson = useMemo(() => getLesson(title.trim()), [title]);
  const suggestions = useMemo(() => suggestLessons(title), [title]);

  const generate = () => {
    if (!title.trim()) return;

    const base =
      lesson || {
        title: title.trim(),
        domain: "",
        theme: "よりよい生き方",
        aim: "自分の生活を見直す",
        keywords: ["心の動き", "判断", "関わり", "思いやり", "自分事"],
      };

    const out = [];
    for (let i = 0; i < count; i++) {
      let text = buildDraft(base, i);
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

  return (
    <div className="wrap">
      <div className="topBar">
        <h1 className="title">道徳所見ジェネレーター（110〜120字）</h1>
        <span className="pill">2年生（追加可）</span>
      </div>

      <div className="warn">
        <b>運用メモ：</b>児童名など個人情報は入力しないでください（所見は教材ベースで生成します）。
      </div>

      <div style={{ height: 12 }} />

      <div className="card">
        <div className="cardPad">
          <div className="row">
            <div className="col">
              <label>教材名</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：ぽんたとかんた / 金の斧 / 祇園祭 など"
                list="lesson-list"
              />
              <datalist id="lesson-list">
                {suggestions.map((l) => (
                  <option key={l.title} value={l.title} />
                ))}
              </datalist>
              <div className="muted">
                {lesson ? (
                  <>
                    登録教材：<span className="kbd">{lesson.domain}</span> ／ {lesson.theme}
                  </>
                ) : (
                  <>未登録教材：汎用モードで生成します（教材を追加すると精度が上がります）</>
                )}
              </div>
            </div>

            <div className="col" style={{ maxWidth: 240 }}>
              <label>出力本数（1〜10）</label>
              <input
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
              <div className="muted">字数は自動で{MIN_CHARS}〜{MAX_CHARS}字に調整します</div>
            </div>

            <div className="col" style={{ maxWidth: 220 }}>
              <button className="btn btnPrimary" onClick={generate} style={{ width: "100%" }}>
                所見を生成する
              </button>
              <div className="muted small">ヒント：候補は入力欄の下矢印でも出ます</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {results.length > 0 && (
        <div className="list">
          {results.map((text, i) => (
            <div key={i} className="card">
              <div className="cardPad">
                <div className="resultMeta">
                  <span>字数：{countChars(text)}</span>
                  <button className="btn btnSecondary" onClick={() => copyText(text)}>
                    コピー
                  </button>
                </div>
                <textarea value={text} readOnly />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 24 }} />
      <div className="muted">
        ※この版はローカル生成（テンプレ＋検査）です。将来、API版に差し替えても「字数調整／NG回避」はそのまま使えます。
      </div>
    </div>
  );
}
