"""
============================
Heartz Project — A/B Testing
============================
Implementasi A/B Testing untuk membandingkan kualitas dan
efektivitas dataset dalam konteks speech classification.

Eksperimen yang diuji:
  1. Clean vs Augmented: Apakah augmentasi meningkatkan
     kualitas distribusi fitur?
  2. Feature Comparison: Apakah fitur MFCC lebih informatif
     dibanding fitur spektral untuk membedakan kelas?
  3. Noise Impact: Apakah augmentasi noise mengubah distribusi
     fitur secara signifikan?

Cara Pakai:
  python ab_testing.py

Atau dari notebook:
  from ab_testing import run_all_ab_tests
"""

import numpy as np
import pandas as pd
from scipy import stats
from pathlib import Path
from itertools import combinations

from config import METADATA_DIR, CLEAN_DIR, AUGMENTED_DIR, SAMPLE_RATE, ensure_dirs
from utils import load_audio, count_dataset


def load_features(source="augmented"):
    """Load fitur CSV."""
    path = METADATA_DIR / f"features_{source}.csv"
    if not path.exists():
        print(f"⚠️  File {path} belum ada. Jalankan feature_engineering.py terlebih dahulu.")
        return None
    return pd.read_csv(path)


def cohens_d(group1, group2):
    """Hitung Cohen's d effect size."""
    n1, n2 = len(group1), len(group2)
    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)
    pooled_std = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
    if pooled_std == 0:
        return 0.0
    return (np.mean(group1) - np.mean(group2)) / pooled_std


def interpret_effect_size(d):
    """Interpretasi Cohen's d."""
    d = abs(d)
    if d < 0.2:
        return "negligible"
    elif d < 0.5:
        return "small"
    elif d < 0.8:
        return "medium"
    else:
        return "large"


def interpret_p_value(p, alpha=0.05):
    """Interpretasi p-value."""
    if p < alpha:
        return f"SIGNIFIKAN (p={p:.6f} < α={alpha})"
    else:
        return f"TIDAK SIGNIFIKAN (p={p:.6f} ≥ α={alpha})"


# ================================================
# EKSPERIMEN 1: Clean vs Augmented Feature Quality
# ================================================
def test_clean_vs_augmented():
    """
    A/B Test: Apakah dataset augmented memiliki distribusi fitur
    yang konsisten dengan dataset clean (original)?

    H0: Tidak ada perbedaan signifikan pada distribusi fitur
        antara sampel original dan augmented.
    H1: Ada perbedaan signifikan.

    Metode: Independent t-test pada fitur-fitur kunci.
    """
    print(f"\n{'='*60}")
    print(f"🧪 EKSPERIMEN 1: Clean (Original) vs Augmented")
    print(f"{'='*60}")
    print(f"\nHipotesis:")
    print(f"  H0: μ_original = μ_augmented (tidak ada perbedaan)")
    print(f"  H1: μ_original ≠ μ_augmented (ada perbedaan)")
    print(f"  α = 0.05")

    df = load_features("augmented")
    if df is None:
        return None

    # Pisahkan original vs augmented
    df_orig = df[df["augmentation_type"] == "original"]
    df_aug = df[df["augmentation_type"] != "original"]

    print(f"\n📊 Ukuran Sampel:")
    print(f"   Group A (Original) : {len(df_orig)} sampel")
    print(f"   Group B (Augmented): {len(df_aug)} sampel")

    # Fitur yang diuji
    test_features = [
        "rms_energy", "peak_amplitude", "zero_crossing_rate",
        "spectral_centroid", "spectral_bandwidth",
        "mfcc_1", "mfcc_2", "mfcc_3",
    ]

    results = []
    print(f"\n{'─'*60}")
    print(f"{'Fitur':<25} {'t-stat':>10} {'p-value':>12} {'Cohen d':>10} {'Effect':>12} {'Kesimpulan'}")
    print(f"{'─'*60}")

    for feat in test_features:
        if feat not in df.columns:
            continue

        group_a = df_orig[feat].dropna()
        group_b = df_aug[feat].dropna()

        # Independent t-test
        t_stat, p_value = stats.ttest_ind(group_a, group_b, equal_var=False)

        # Effect size
        d = cohens_d(group_a, group_b)
        effect = interpret_effect_size(d)

        # Kesimpulan
        significant = "TOLAK H0" if p_value < 0.05 else "TERIMA H0"

        results.append({
            "feature": feat,
            "t_statistic": round(t_stat, 4),
            "p_value": round(p_value, 6),
            "cohens_d": round(d, 4),
            "effect_size": effect,
            "conclusion": significant,
            "mean_original": round(group_a.mean(), 6),
            "mean_augmented": round(group_b.mean(), 6),
        })

        print(f"{feat:<25} {t_stat:>10.4f} {p_value:>12.6f} {d:>10.4f} {effect:>12} {significant}")

    print(f"{'─'*60}")

    # Kesimpulan keseluruhan
    n_significant = sum(1 for r in results if r["conclusion"] == "TOLAK H0")
    print(f"\n📋 Ringkasan:")
    print(f"   Fitur yang diuji       : {len(results)}")
    print(f"   Perbedaan signifikan   : {n_significant}")
    print(f"   Tidak signifikan       : {len(results) - n_significant}")

    if n_significant <= len(results) // 2:
        print(f"\n✅ KESIMPULAN: Augmentasi MENJAGA konsistensi distribusi fitur.")
        print(f"   Dataset augmented dapat dipercaya untuk training model.")
    else:
        print(f"\n⚠️ KESIMPULAN: Augmentasi MENGUBAH distribusi beberapa fitur.")
        print(f"   Perlu evaluasi lebih lanjut apakah ini berdampak positif atau negatif.")

    return pd.DataFrame(results)


# ==================================================
# EKSPERIMEN 2: Vokal vs Konsonan Feature Comparison
# ==================================================
def test_vokal_vs_konsonan():
    """
    A/B Test: Apakah fitur audio kelas vokal berbeda signifikan
    dari kelas konsonan (bilabial)?

    H0: Tidak ada perbedaan signifikan pada fitur audio
        antara kelas vokal dan konsonan.
    H1: Ada perbedaan signifikan.

    Metode: Independent t-test + Mann-Whitney U test.
    """
    print(f"\n{'='*60}")
    print(f"🧪 EKSPERIMEN 2: Vokal vs Konsonan (Bilabial)")
    print(f"{'='*60}")
    print(f"\nHipotesis:")
    print(f"  H0: μ_vokal = μ_konsonan (tidak ada perbedaan)")
    print(f"  H1: μ_vokal ≠ μ_konsonan (ada perbedaan)")
    print(f"  α = 0.05")

    df = load_features("augmented")
    if df is None:
        return None

    # Hanya gunakan data original untuk menghindari bias augmentasi
    df = df[df["augmentation_type"] == "original"].copy()

    vokal_labels = ["A", "E", "I", "O", "U"]
    konsonan_labels = [l for l in df["label"].unique() if l not in vokal_labels]

    df_vokal = df[df["label"].isin(vokal_labels)]
    df_konsonan = df[df["label"].isin(konsonan_labels)]

    print(f"\n📊 Ukuran Sampel:")
    print(f"   Group A (Vokal)    : {len(df_vokal)} sampel ({vokal_labels})")
    print(f"   Group B (Konsonan) : {len(df_konsonan)} sampel")

    test_features = [
        "zero_crossing_rate", "spectral_centroid", "spectral_bandwidth",
        "spectral_flatness", "mfcc_1", "mfcc_2", "mfcc_3",
        "rms_energy",
    ]

    results = []
    print(f"\n{'─'*60}")
    print(f"{'Fitur':<25} {'t-stat':>10} {'p-value':>12} {'Cohen d':>10} {'Effect':>12} {'Kesimpulan'}")
    print(f"{'─'*60}")

    for feat in test_features:
        if feat not in df.columns:
            continue

        group_a = df_vokal[feat].dropna()
        group_b = df_konsonan[feat].dropna()

        t_stat, p_value = stats.ttest_ind(group_a, group_b, equal_var=False)
        d = cohens_d(group_a, group_b)
        effect = interpret_effect_size(d)
        significant = "TOLAK H0" if p_value < 0.05 else "TERIMA H0"

        # Juga lakukan Mann-Whitney U test (non-parametrik)
        u_stat, u_p = stats.mannwhitneyu(group_a, group_b, alternative="two-sided")

        results.append({
            "feature": feat,
            "t_statistic": round(t_stat, 4),
            "p_value_ttest": round(p_value, 6),
            "u_statistic": round(u_stat, 4),
            "p_value_mannwhitney": round(u_p, 6),
            "cohens_d": round(d, 4),
            "effect_size": effect,
            "conclusion": significant,
            "mean_vokal": round(group_a.mean(), 6),
            "mean_konsonan": round(group_b.mean(), 6),
        })

        print(f"{feat:<25} {t_stat:>10.4f} {p_value:>12.6f} {d:>10.4f} {effect:>12} {significant}")

    print(f"{'─'*60}")

    # Cari fitur terbaik untuk pembeda
    best_features = sorted(results, key=lambda x: abs(x["cohens_d"]), reverse=True)
    print(f"\n📋 Fitur Terbaik untuk Membedakan Vokal vs Konsonan:")
    for i, r in enumerate(best_features[:3]):
        print(f"   {i+1}. {r['feature']} (Cohen's d = {r['cohens_d']:.4f}, {r['effect_size']})")

    print(f"\n✅ KESIMPULAN:")
    large_effects = [r for r in results if r["effect_size"] in ("medium", "large")]
    if large_effects:
        feats_str = ", ".join(r["feature"] for r in large_effects)
        print(f"   Fitur {feats_str} menunjukkan perbedaan signifikan")
        print(f"   antara vokal dan konsonan — BAIK untuk klasifikasi!")
    else:
        print(f"   Tidak ada fitur dengan effect size medium/large.")
        print(f"   Model mungkin perlu fitur lebih kompleks (CNN pada spectrogram).")

    return pd.DataFrame(results)


# ==================================================
# EKSPERIMEN 3: Noise Impact on Feature Distribution
# ==================================================
def test_noise_impact():
    """
    A/B Test: Apakah augmentasi noise (aug01) secara signifikan
    mengubah distribusi MFCC dibanding data original?

    H0: Augmentasi noise TIDAK mengubah distribusi MFCC secara signifikan.
    H1: Augmentasi noise MENGUBAH distribusi MFCC secara signifikan.

    Metode: Paired t-test (karena setiap file original punya pasangan aug01).
    """
    print(f"\n{'='*60}")
    print(f"🧪 EKSPERIMEN 3: Noise Impact pada MFCC")
    print(f"{'='*60}")
    print(f"\nHipotesis:")
    print(f"  H0: Augmentasi noise tidak mengubah MFCC secara signifikan")
    print(f"  H1: Augmentasi noise mengubah MFCC secara signifikan")
    print(f"  α = 0.05")

    df = load_features("augmented")
    if df is None:
        return None

    df_orig = df[df["augmentation_type"] == "original"].copy()
    df_noise = df[df["augmentation_type"] == "aug01"].copy()

    # Pastikan kita punya pasangan yang sama
    # Buat key dari nama file (tanpa _aug01)
    df_orig["base_name"] = df_orig["filename"].apply(lambda x: x.replace(".wav", ""))
    df_noise["base_name"] = df_noise["filename"].apply(
        lambda x: x.replace("_aug01.wav", "")
    )

    # Merge berdasarkan base_name
    merged = df_orig.merge(df_noise, on="base_name", suffixes=("_orig", "_noise"))

    print(f"\n📊 Pasangan yang ditemukan: {len(merged)}")

    mfcc_cols = [f"mfcc_{i}" for i in range(1, 14)]
    results = []

    print(f"\n{'─'*60}")
    print(f"{'Fitur':<15} {'Mean Diff':>12} {'t-stat':>10} {'p-value':>12} {'Effect':>12} {'Kesimpulan'}")
    print(f"{'─'*60}")

    for mfcc in mfcc_cols:
        col_orig = f"{mfcc}_orig"
        col_noise = f"{mfcc}_noise"

        if col_orig not in merged.columns or col_noise not in merged.columns:
            continue

        orig_vals = merged[col_orig].dropna()
        noise_vals = merged[col_noise].dropna()

        # Paired t-test
        min_len = min(len(orig_vals), len(noise_vals))
        t_stat, p_value = stats.ttest_rel(orig_vals[:min_len], noise_vals[:min_len])

        mean_diff = float(np.mean(orig_vals[:min_len] - noise_vals[:min_len]))
        d = cohens_d(orig_vals, noise_vals)
        effect = interpret_effect_size(d)
        significant = "TOLAK H0" if p_value < 0.05 else "TERIMA H0"

        results.append({
            "feature": mfcc,
            "mean_difference": round(mean_diff, 6),
            "t_statistic": round(t_stat, 4),
            "p_value": round(p_value, 6),
            "cohens_d": round(d, 4),
            "effect_size": effect,
            "conclusion": significant,
        })

        print(f"{mfcc:<15} {mean_diff:>12.6f} {t_stat:>10.4f} {p_value:>12.6f} {effect:>12} {significant}")

    print(f"{'─'*60}")

    # Ringkasan
    n_sig = sum(1 for r in results if r["conclusion"] == "TOLAK H0")
    n_small = sum(1 for r in results if r["effect_size"] in ("negligible", "small"))

    print(f"\n📋 Ringkasan:")
    print(f"   MFCC yang diuji           : {len(results)}")
    print(f"   Perbedaan signifikan       : {n_sig}")
    print(f"   Effect size kecil/negligible: {n_small}")

    print(f"\n✅ KESIMPULAN:")
    if n_small >= len(results) // 2:
        print(f"   Augmentasi noise memiliki dampak MINIMAL pada distribusi MFCC.")
        print(f"   Teknik augmentasi noise AMAN digunakan — tidak merusak fitur penting.")
    else:
        print(f"   Augmentasi noise MENGUBAH distribusi MFCC secara signifikan.")
        print(f"   Pertimbangkan untuk mengurangi intensitas noise pada augmentasi.")

    return pd.DataFrame(results)


# ============================================================
# RUN ALL
# ============================================================
def run_all_ab_tests():
    """Jalankan semua eksperimen A/B testing."""
    print(f"\n{'#'*60}")
    print(f"#  HEARTZ — A/B TESTING SUITE")
    print(f"#  Pengujian Hipotesis Dataset Audio")
    print(f"{'#'*60}")

    results = {}

    # Eksperimen 1
    results["clean_vs_augmented"] = test_clean_vs_augmented()

    # Eksperimen 2
    results["vokal_vs_konsonan"] = test_vokal_vs_konsonan()

    # Eksperimen 3
    results["noise_impact"] = test_noise_impact()

    print(f"\n{'#'*60}")
    print(f"#  SEMUA EKSPERIMEN SELESAI")
    print(f"{'#'*60}\n")

    return results


if __name__ == "__main__":
    ensure_dirs()
    run_all_ab_tests()
