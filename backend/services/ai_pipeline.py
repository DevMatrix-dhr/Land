"""
Core AI pipeline: preprocessing -> OCR -> NLP field extraction -> validation.
This module holds the required functions called by the /documents routes.
"""
import cv2
import numpy as np
import hashlib
import re
from paddleocr import PaddleOCR

ocr_engine = PaddleOCR(use_angle_cls=True, lang="en")  # swap/add lang packs for hi, mr, te, etc.

FIELD_PATTERNS = {
    "khasra_number": re.compile(r"khasra\s*(?:no\.?|number)?\s*[:\-]?\s*([0-9/]+)", re.IGNORECASE),
    "khata_number": re.compile(r"khata\s*(?:no\.?|number)?\s*[:\-]?\s*([0-9/]+)", re.IGNORECASE),
    "plot_area": re.compile(r"area\s*[:\-]?\s*([0-9.]+)\s*(hectare|acre|bigha)?", re.IGNORECASE),
}


def compute_file_hash(file_bytes: bytes) -> str:
    """Used by the ingestion endpoint for duplicate-document detection."""
    return hashlib.sha256(file_bytes).hexdigest()


def preprocess_document(image_path: str) -> str:
    """
    Tier 1 - Document Forensics Engine.
    Deskew, denoise, contrast-enhance, and binarize a faded/tilted scan.
    Returns path to the cleaned image used downstream by OCR.
    """
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    denoised = cv2.fastNlMeansDenoising(gray, h=30)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast_img = clahe.apply(denoised)

    # Deskew via minAreaRect on thresholded text mask
    thresh_for_angle = cv2.threshold(contrast_img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    coords = np.column_stack(np.where(thresh_for_angle > 0))
    angle = 0.0
    if len(coords) > 0:
        rect_angle = cv2.minAreaRect(coords)[-1]
        angle = -(90 + rect_angle) if rect_angle < -45 else -rect_angle
        (h, w) = contrast_img.shape
        m = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
        contrast_img = cv2.warpAffine(contrast_img, m, (w, h), flags=cv2.INTER_CUBIC,
                                       borderMode=cv2.BORDER_REPLICATE)

    _, binarized = cv2.threshold(contrast_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    processed_path = image_path.rsplit(".", 1)[0] + "_processed.jpg"
    cv2.imwrite(processed_path, binarized)
    return processed_path


def run_ocr(processed_image_path: str) -> list[dict]:
    """
    Tier 2 - Multilingual OCR pass. Returns raw text spans with bounding
    boxes and per-span confidence, feeding the field extractor below.
    """
    result = ocr_engine.ocr(processed_image_path, cls=True)
    spans = []
    for line in result:
        for bbox, (text, confidence) in line:
            spans.append({
                "text": text,
                "confidence": float(confidence) * 100,
                "bounding_box": {"points": bbox},
            })
    return spans


def extract_structured_fields(ocr_spans: list[dict]) -> dict:
    """
    Tier 2 - Layout-aware NLP field mapping. Maps raw OCR spans onto the
    predefined land-record schema (khasra, khata, owner, area, etc.)
    using regex/NLP matching. In production, swap the regex matcher for
    a fine-tuned LayoutLMv3 model for higher accuracy on handwritten text.
    """
    full_text = " ".join(span["text"] for span in ocr_spans)
    fields = {}

    for field_name, pattern in FIELD_PATTERNS.items():
        match = pattern.search(full_text)
        if match:
            matching_spans = [s for s in ocr_spans if match.group(1) in s["text"]]
            confidence = matching_spans[0]["confidence"] if matching_spans else 60.0
            fields[field_name] = {"value": match.group(1), "confidence": confidence}
        else:
            fields[field_name] = {"value": None, "confidence": 0.0}

    return fields


def run_validation_rules(record: dict) -> list[dict]:
    """
    Tier 3 - Deterministic cross-verification engine.
    Runs business-rule checks (math consistency, format checks) and
    returns pass/fail results to store in validation_results.
    """
    results = []

    area = record.get("plot_area_value")
    results.append({
        "rule_name": "area_positive_check",
        "passed": bool(area and area > 0),
        "details": {"plot_area_value": area},
    })

    khasra = record.get("khasra_number")
    results.append({
        "rule_name": "khasra_format_check",
        "passed": bool(khasra and re.match(r"^[0-9]+(/[0-9]+)?$", khasra)),
        "details": {"khasra_number": khasra},
    })

    return results


def compute_overall_confidence(fields: dict) -> float:
    """Aggregates per-field confidence into one record-level score used
    to route a record to auto-approve vs. the human review queue."""
    scores = [f["confidence"] for f in fields.values() if f["confidence"] is not None]
    return round(sum(scores) / len(scores), 2) if scores else 0.0
