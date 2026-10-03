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
