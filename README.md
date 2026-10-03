# PLAbiologics · Research Workspace

A responsive research-image workspace for exploring cell images, measuring regions, and recording reviews.

**Live app:** https://lassenai.github.io/plabiologics/

## Workflows

The **Cell culture analysis** tab estimates cell-covered area using local intensity variation. **Tissue fibrosis analysis** reviews candidate Sirius red or Masson-positive area divided by detected tissue, with adjustable color and tissue thresholds. The first and default **Cell image workspace** tab retains the original BBBC019 model demo, including 3D, 2D analysis, original images and reference comparison. Switching tabs preserves the existing workspace session.

Culture and fibrosis are separate, untrained image-processing baselines. They are not validated company models. Culture coverage is not cell count or viability; stain-positive area is not a fibrosis grade. Real company workflows have not yet been confirmed.

The new workspaces include original/analysis/side-by-side views, drag-to-select ROI, original source figure viewing, local uploads, notes and CSV export with numerator, denominator, settings, crop, ROI and provenance. Use **Select ROI** then drag in the original view; **Full image** resets the region. Fibrosis uploads must be Sirius red or Masson images, with the corresponding stain selected explicitly. TIFF and whole-slide formats are not supported.

Two culture examples and eight histology examples are selected regions from Kim et al. (2020), DOI: https://doi.org/10.1186/s13287-020-02029-3 (CC BY 4.0). Original published figures and exact crop coordinates are preserved under `assets/research/`. These are compressed figure crops, not raw research data. They lack reference masks, are not a time series, and cannot reproduce the paper's full-field statistics. See `THIRD_PARTY_NOTICES.md`.

The research workspaces analyze copies with a maximum dimension of 512 pixels. Uploaded originals retain their original resolution. A 9 × 9 intensity standard deviation divided by 0.13 supplies the culture score. Fibrosis uses red dominance `(R - max(G,B))/255` or blue dominance `(B-R)/255` with `B > 0.9G`; only pixels with mean RGB intensity above 35 and below the selected ceiling enter its denominator. Default culture/color thresholds are 0.35/0.08. All values are uncalibrated review aids.

## Features

- Korean and English interface with a persistent language preference.
- Eleven public sample images and local PNG, JPG, or WebP uploads.
- Rotatable 2.5D intensity surface, 2D segmentation overlay, unobstructed original-image view, and reference-mask comparison.
- Original-image dialog and download. Uploaded originals retain their resolution and original file bytes; packaged public samples are 256 × 256 pixels, not full-resolution experimental originals.
- Adjustable segmentation threshold, gap area, Dice score, and area error where reference masks exist.
- Device-local review notes and reviewed status.
- CSV export of measurements, analysis provenance, and review notes.

## Quick start

No dependencies or API keys are required. From the repository root, run:

```powershell
python -m http.server 8792 --bind 127.0.0.1
```

Open http://127.0.0.1:8792 in your browser. GitHub Pages serves the root of the `main` branch.

## Usage

1. Select **한국어** or **English** in the header.
2. Choose a sample or select **Open image**.
3. Use **Original image** to see the image without segmentation colors. Select **View original** to inspect and download the available source image.
4. Explore **3D view**, **2D analysis**, or **Compare masks**, then adjust the segmentation threshold.
5. Add a review note, mark the image as reviewed, and select **Export** to download a CSV.

Uploads remain in memory for the current page session. Notes and language preferences use browser local storage and do not sync across devices. Images and notes are not uploaded to a server.

## Offline build

```powershell
python scripts/build.py
```

This creates `outputs/plab-ai-proposal.html`, a self-contained offline version. If local `work/demo_data.json` exists, the build refreshes packaged data from it; otherwise it uses tracked `assets/data.js`. Python standard library only.

## Source structure

- `index.html`: workspace and dialogs.
- `assets/app.css`: responsive layout and styling.
- `assets/app.js`: rendering, measurements, uploads, review notes, and exports.
- `assets/i18n.js`: Korean/English translations and language preference.
- `assets/research.js`: culture/fibrosis workflows, bilingual UI, ROI and exports.
- `assets/research-analysis.js`: pure pixel-measurement baselines.
- `assets/research/`: unmodified source figures and crop provenance.
- `assets/data.js`: public samples, reference masks, and cached predictions.
- `assets/validation-manifest.json`: dataset split and model validation record.
- `scripts/build.py`: offline build.
- `THIRD_PARTY_NOTICES.md`: dataset and logo attribution.

Local working files, intermediate artifacts, and generated offline output are excluded from Git.

## Verification

```powershell
node scripts/test-research.cjs
```

Checks denominator exclusions, zero-tissue handling, ROI boundaries, stain direction, threshold behavior and texture baselines using known pixel fixtures. This is software verification, not biological validation.

## Cell migration analysis scope

Public samples use cached predictions from a lightweight HistGradientBoostingClassifier trained on BBBC019v2 SN15 DA3 cell images. These are **not placenta-derived MSC images**. On 11 held-out images, the fixed threshold of 0.20 produced a mean Dice score of 0.804 and mean absolute area error of 1.38 percentage points.

New uploads use a browser-local intensity-variation texture baseline, not inference from the sample model. Analysis copies preserve aspect ratio and have a maximum dimension of 256 pixels. Original uploads remain available separately. Reference performance metrics are unavailable for uploads.

The 3D view is a **2.5D intensity visualization**, not a reconstruction of cell thickness or tissue depth. Gap area is not cell viability or therapeutic efficacy. Scores are not calibrated probabilities. No Jev or LLM API is connected.

This is an independently developed research MVP, not an official company service or a clinically or production-validated product.

## Attribution

The sample dataset is licensed under CC BY 3.0; see `THIRD_PARTY_NOTICES.md` for credits and modifications. The PLAbiologics logo belongs to its respective owner and was sourced from the official website.
