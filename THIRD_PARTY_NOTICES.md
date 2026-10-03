# Attribution and data provenance

## BBBC019v2 / SN15

The sample images and manual masks come from the Broad Bioimage Benchmark Collection:
https://bbbc.broadinstitute.org/BBBC019

License: Creative Commons Attribution 3.0 Unported (CC BY 3.0)
https://creativecommons.org/licenses/by/3.0/

Credited providers: Petros Komoutsakos (TScratch), Isaac P. Witz, Ilan Tsarfay, and Assaf Zaritsky.
SN15 images were acquired by Sari Natan, Doron Kaplan, and Yaniv Goikhman from Ilan Tsarfay's laboratory at Tel Aviv University. Assaf Zaritsky labeled the SN15 regions.

References: Ljosa V, Sokolnicki KL, Carpenter AE. Nature Methods (2012), 9:637. Zaritsky et al. BMC Bioinformatics (2013), 14:319.

Changes: images resized to 256 by 256; manual foreground masks inverted to represent gaps; texture features used to fit a small classifier; cached scores and 2.5D rendering added. Eleven evaluation images are included. This is not the official benchmark split and is not a clinical or PLAbiologics efficacy validation.

## PLAbiologics logo

Source: https://www.plabiologics.com/images/LOGO.png
The company logo is displayed for this requested PLAbiologics-branded research prototype. Trademark and logo rights remain with their owner. No endorsement or official affiliation is asserted, and no license to this logo is granted by this repository.

## Application behavior

No Jev or LLM API is called. New uploads use a browser-local texture baseline, not the sample model. Notes are stored in the user's browser. Height surfaces show image brightness, not physical cell depth.

## Published culture and histology figures

Kim, J.Y., Choi, J.H., Jun, J.H., Park, S., Jung, J., Bae, S.H. and Kim, G.J. (2020). Enhanced PRL-1 expression in placenta-derived mesenchymal stem cells accelerates hepatic function via mitochondrial dynamics in a cirrhotic rat model. Stem Cell Research & Therapy 11, 512.

Source: https://doi.org/10.1186/s13287-020-02029-3
License: https://creativecommons.org/licenses/by/4.0/ (CC BY 4.0).

The original published Figure 1 and Figure 5 PNG files are preserved in assets/research. The app selects subregions of Figure 1b (culture morphology, Lenti and AMAXA) and Figure 5c (Sirius red and Masson-stained rat liver). Crops avoid text, borders, and scale bars; no generative image modification is used. The app adds analysis overlays to separate copies. Exact crop coordinates, image origins, and checksums are in assets/research/provenance.json.

These are published figure examples, not company-provided raw data or validated ground truth. Results from these partial fields must not be presented as reproduction of the article's quantitative results or as treatment-effect comparisons. The app does not establish company authorship or ownership of these images.
