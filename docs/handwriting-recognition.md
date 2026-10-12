# Reading handwritten Korean in Test

How English → Korean answers are read and graded, and why (research and benchmarks from October 2026). The code is `src/recall/handwriting.ts`; the regression test replays the recorded engine answers in `tests/fixtures/handwriting-readings.json`.

## The requirement

Grade the word the learner meant to write, not how neat it is. Messy but correct writing gets full credit; a doubtful reading never costs a point; a misspelling is not silently accepted. No pixel or image comparison against a reference glyph. The app is static: no backend, no keys, iPhone Safari first.

## Options

| Option | Korean | iPhone web | Key or server | Verdict |
| --- | --- | --- | --- | --- |
| W3C Handwriting Recognition API | no (English only) | no (ChromeOS only) | no | not usable |
| ML Kit Digital Ink | yes | no (native apps only) | no | not usable |
| Apple Scribble | yes | no (iPad + Pencil only) | no | not usable |
| Zinnia / Tegaki | no Korean model | | no | not usable |
| MyScript, Cloud Vision, Azure Read, vision LLMs | yes | yes | key in the page, or a server | against the no-keys design |
| **Google handwriting input engine** (behind Gboard, Google Translate) | yes | yes (CORS open) | no | **used** |
| On-device OCR: PaddleOCR PP-OCRv5 Korean (ONNX) | yes | yes, ~21 MB | no | viable later as an offline fallback (below) |

The Google engine is stroke-based (order, direction, timing) and trained on real handwriting, so it reads intent rather than shapes. Its endpoint is undocumented: it can change without notice, and only the ink goes to Google (no cookies, no page address; the IP and browser are visible to it, as for any request). Setup and the guide say so. If it fails, nothing is lost: the learner judges the answer.

## Benchmark

Synthetic online handwriting: every one of the 324 answers written neat, casual, and messy with standard stroke order (jamo templates, slant, jitter, merged strokes, shortened strokes), 210 learner-style misspellings (one jamo off, or a syllable dropped; 82 real words, 128 non-words), 150 more non-word misspellings, and 120 cases of another vocabulary word written instead. 2,382 requests, all answered. Synthetic ink is more regular than finger writing, so treat these as upper bounds.

| Correct writing | Neat | Casual | Messy |
| --- | ---: | ---: | ---: |
| The answer is the engine's first reading | 100% | 98.8% | 98.8% |
| The answer is among its readings | 100% | 99.8% | 99.5% |
| Readings returned (mean, up to 10) | 5.4 | 5.7 | 6.2 |
| Latency p50 / p95 (desktop, wired) | 114 / 250 ms | 111 / 244 ms | 116 / 244 ms |

The risk is the other way round: the engine's language model sometimes "corrects" a misspelled non-word into the answer (갈샠 → 갈색, 가르처요 → 가르쳐요): 12.6% of non-word misspellings, more when messy, never a real word. Another vocabulary word written instead was never read as the answer.

## Grading

Deterministic, from the candidate list and the closed vocabulary (`gradeReading`):

1. **Correct** when the first reading is an accepted answer (the word, its dictionary form, a same-meaning word for the same speaker; spacing and punctuation aside) and at least half of the engine's strings agree with it (`agreement = 0.5`).
2. **The learner is asked** when the first reading is the answer without that agreement, when the answer appears lower in the list, when the reading is close to the answer, when nothing could be made out, and when the engine can't be reached. They pick what they wrote from the readings, or compare their writing with the answer themselves.
3. **Incorrect** only when no reading is the answer and the first is clearly something else: another vocabulary word, or at least max(4, 40% of the answer's) jamo away. The learner can still say the reading was wrong.

| Rule for an accepted first reading | Correct writing graded at once (neat / casual / messy) | Correct writing marked wrong | Non-word misspellings credited |
| --- | --- | ---: | ---: |
| Always accept | 100% / 98.8% / 98.8% | 0% | 12.6% |
| **Half the strings agree (used)** | **94.3% / 89.1% / 79.5%** | **0%** | **5.4%** |
| 60% agree | 73.3% pooled | 0% | 2.9% |
| Half agree, and the next reading isn't one jamo off | 69.1% / 61.6% / 43.6% | 0% | 1.1% |

Replaying the recorded engine answers through the app's own grading (the regression test does this) gives 94.6% / 89.4% / 79.7% graded at once and none marked wrong, slightly above the benchmark's figures because Latin letters (SF 영화) are compared without case.

`agreement` is the one dial: higher asks the learner more often and lets fewer misspellings through. The stricter rows ask about four in ten correct answers to confirm, which makes every other question a chore; the chosen row asks about one in eight. A rejection step that marks any unaccepted reading wrong would also mark correct writing wrong (가을 read as 17을, 누나 as 뉘), so readings close to the answer are always asked.

## Request

Strokes as stored (each point's time counted from its stroke's start), scaled to a 184 px-high guide that keeps the pad's own proportions (420 × 184 on desktop, the scale the grading was measured at). The engine's lower readings shift with the request format, so changing it means re-measuring. Optional fields (`pre_context`, `max_num_results`, `ko_KR`) made no difference; `dbg=1` exposes no scores.

## On-device recognition, for an offline version

PaddleOCR's `korean_PP-OCRv5_mobile_rec` (Apache-2.0, official ONNX) runs under onnxruntime-web: render the strokes to a 48 px-high image, then score every vocabulary string with CTC forced alignment. On the same ink it ranks the answer first 100% / 100% / 96.3% of the time (neat / casual / messy), in about 35 ms per answer on a laptop (an iPhone is estimated at 60–120 ms, iOS 16.4+). Costs: a 6.8 MB fp16 model plus 14 MB of WASM (about 6–8 MB compressed), precached for offline use, run in a worker. Through a draft of this grading it marked 9.7% of messy correct answers wrong; replaying its saved examples through the final rule, 27 of those 31 become questions and 4 stay wrong. It still marks some correct writing wrong, which the online engine never did, so it should only stand in when offline (instead of the learner judging), after checking on real handwriting. It would plug in as another `HandwritingRecognizer`.
