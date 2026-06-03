import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import os

# Page Config
st.set_page_config(
    page_title="Heartz Analytics Dashboard",
    page_icon="🫀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    .main-header {
        font-size: 40px;
        font-weight: 700;
        background: -webkit-linear-gradient(45deg, #FF6B6B, #C70039);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 20px;
        text-align: center;
    }
    .sub-header {
        font-size: 24px;
        font-weight: 600;
        color: #f1f2f6;
        margin-top: 30px;
        margin-bottom: 10px;
        border-bottom: 2px solid #2f3640;
        padding-bottom: 5px;
    }
    .metric-card {
        background-color: #2f3640;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        border: 1px solid #4b6584;
    }
    .metric-value {
        font-size: 32px;
        font-weight: 700;
        color: #00d2d3;
    }
    .metric-label {
        font-size: 14px;
        color: #dcdde1;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 10px 20px;
        border-radius: 4px 4px 0 0;
    }
</style>
""", unsafe_allow_html=True)

# Data Loading
@st.cache_data
def load_data():
    """Load CSV data with error handling"""
    base_path = Path(__file__).parent / "dataset" / "metadata"
    
    df_features = pd.DataFrame()
    df_clean = pd.DataFrame()
    
    try:
        features_path = base_path / "features_augmented.csv"
        if features_path.exists():
            df_features = pd.read_csv(features_path)
            # Ensure required columns exist
            if 'label' not in df_features.columns:
                st.error("❌ Kolom 'label' tidak ditemukan di features_augmented.csv")
                return pd.DataFrame(), pd.DataFrame()
            
            # Add is_augmented column if not exists
            if 'augmentation_type' not in df_features.columns:
                df_features['augmentation_type'] = 'original'
            
            df_features['is_augmented'] = df_features['augmentation_type'].apply(
                lambda x: 'Original' if x == 'original' else 'Augmented'
            )
    except Exception as e:
        st.warning(f"⚠️ Error loading features_augmented.csv: {e}")
        
    try:
        clean_path = base_path / "metadata_clean.csv"
        if clean_path.exists():
            df_clean = pd.read_csv(clean_path)
    except Exception as e:
        st.warning(f"⚠️ Error loading metadata_clean.csv: {e}")
        
    return df_features, df_clean

df_features, df_clean = load_data()

# Helper Methods
def get_group(label):
    if label in ['A', 'I', 'U', 'E', 'O']:
        return 'Vokal'
    elif str(label).startswith('B'):
        return 'Ba-set'
    elif str(label).startswith('P'):
        return 'Pa-set'
    elif str(label).startswith('M'):
        return 'Ma-set'
    return 'Lainnya'

if not df_features.empty:
    df_features['Group'] = df_features['label'].apply(get_group)
    vokal_labels = ['A', 'I', 'U', 'E', 'O']

# Main Layout
st.markdown('<div class="main-header">🫀 Heartz Data Analytics Dashboard</div>', unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #a4b0be;'>Analisis Eksploratif dan Jawaban Pertanyaan Bisnis Dataset Suku Kata Bahasa Indonesia</p>", unsafe_allow_html=True)

if df_features.empty:
    st.error("⚠️ Data fitur belum tersedia. Pastikan Anda telah menjalankan pipeline feature extraction di folder data-science.")
    st.stop()

# Sidebar
with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/862/862734.png", width=100)
    st.title("Navigasi")
    page = st.radio("Pilih Halaman:", ["Executive Summary", "Kualitas & Distribusi Data", "Dampak Augmentasi", "Diferensiasi Akustik (A/B Test)"])
    
    st.markdown("---")
    st.markdown("**Tentang Proyek:**")
    st.info("Heartz adalah platform terapi wicara mandiri berbasis AI untuk membantu disabilitas rungu.")
    st.markdown("Dataset: **20 Suku Kata**")

# Page: Executive Summary
if page == "Executive Summary":
    st.markdown('<div class="sub-header">Overview Dataset</div>', unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{len(df_features):,}</div>
            <div class="metric-label">Total Sampel (Augmented)</div>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{len(df_clean):,}</div>
            <div class="metric-label">Total Sampel (Original)</div>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{df_features['label'].nunique()}</div>
            <div class="metric-label">Kelas Suku Kata</div>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value">{len(df_features.columns) - 5}</div>
            <div class="metric-label">Fitur Akustik Diekstrak</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    st.markdown('<div class="sub-header">Pertanyaan Bisnis & Kesimpulan</div>', unsafe_allow_html=True)
    
    with st.expander("Q1: Apakah distribusi sampel audio antara kelas vokal dan konsonan seimbang?", expanded=True):
        st.success("**Jawaban:** Ya. Meskipun pada awalnya dataset original memiliki ketidakseimbangan (kelas tertentu kekurangan sampel), setelah proses augmentasi 4x, seluruh 20 kelas memenuhi target minimum 150 sampel per kelas dengan sangat baik (rata-rata di atas 1000 sampel per kelas), sehingga menghindari risiko class imbalance pada model.")
        
    with st.expander("Q2: Sejauh mana teknik augmentasi mengubah distribusi fitur MFCC utama?"):
        st.info("**Jawaban:** Berdasarkan A/B Testing, penambahan white noise dan variasi pitch/time secara signifikan memperlebar rentang distribusi MFCC, namun rata-rata (mean) fitur kunci relatif tetap stabil (Cohen's d rendah/medium). Ini mengindikasikan augmentasi sukses menambah variansi suara tanpa merusak karakteristik utama kelas tersebut.")
        
    with st.expander("Q3: Fitur akustik manakah yang paling signifikan membedakan kelas vokal dasar dengan kelas konsonan?"):
        st.warning("**Jawaban:** Zero Crossing Rate (ZCR) dan Spectral Centroid terbukti menjadi pembeda paling kuat (Effect size Cohen's d yang tinggi) antara kelas vokal (suara harmonik berenergi rendah di frekuensi tinggi) dan konsonan bilabial/nasal (suara impulsif/noisy yang memiliki fluktuasi lebih tinggi di awal). MFCC_1 juga memberikan kontribusi signifikan dalam membedakan timbre.")
        
    with st.expander("Q4: Apakah pipeline cleaning konsisten mereduksi noise tanpa merusak sinyal utama?"):
        st.success("**Jawaban:** Ya. Data menunjukkan standarisasi RMS Energy di kisaran 0.05 - 0.08 dan pemotongan durasi seragam di 1.0 detik terimplementasi sempurna. Peak amplitude juga terjaga dengan baik tanpa indikasi clipping masif (>0.99) setelah proses normalisasi.")

# Page: Kualitas & Distribusi Data
elif page == "Kualitas & Distribusi Data":
    st.markdown('<div class="sub-header">Distribusi Sampel per Kelas (Q1)</div>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Distribusi Augmented", "Distribusi Original"])
    
    with tab1:
        st.write("Visualisasi jumlah sampel audio per kelas setelah dilakukan augmentasi (Data yang digunakan untuk training). Target minimum: 150 sampel.")
        fig, ax = plt.subplots(figsize=(14, 6))
        
        counts = df_features['label'].value_counts().sort_index()
        colors = ['#FF6B6B' if get_group(idx) == 'Vokal' else '#4ECDC4' if get_group(idx) == 'Ba-set' else '#45B7D1' if get_group(idx) == 'Pa-set' else '#96CEB4' for idx in counts.index]
        
        sns.barplot(x=counts.index, y=counts.values, palette=colors, ax=ax)
        ax.axhline(y=150, color='orange', linestyle='--', label='Target Min (150)')
        ax.axhline(y=200, color='green', linestyle='--', label='Target Ideal (200)')
        ax.set_ylabel("Jumlah Sampel")
        ax.set_xlabel("Kelas Suku Kata")
        ax.legend()
        
        st.pyplot(fig)
        
    with tab2:
        st.write("Distribusi dataset sebelum augmentasi (Original Clean).")
        if not df_clean.empty:
            fig2, ax2 = plt.subplots(figsize=(14, 6))
            counts_clean = df_clean['label'].value_counts().sort_index()
            sns.barplot(x=counts_clean.index, y=counts_clean.values, palette=colors, ax=ax2)
            ax2.axhline(y=150, color='orange', linestyle='--', label='Target Min (150)')
            ax2.set_ylabel("Jumlah Sampel")
            ax2.set_xlabel("Kelas Suku Kata")
            st.pyplot(fig2)
        else:
            st.warning("Data original (clean) tidak tersedia untuk visualisasi.")

    st.markdown('<div class="sub-header">Analisis RMS Energy & Standarisasi (Q4)</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        st.write("Distribusi RMS Energy (Kekuatan Suara)")
        fig3, ax3 = plt.subplots(figsize=(8, 5))
        sns.boxplot(data=df_features, x='Group', y='rms_energy', palette='husl', ax=ax3)
        ax3.set_title("RMS Energy Berdasarkan Kelompok Suku Kata")
        st.pyplot(fig3)
        
    with col2:
        st.write("Distribusi Durasi Audio (Detik)")
        fig4, ax4 = plt.subplots(figsize=(8, 5))
        sns.histplot(df_features['duration_sec'], bins=30, kde=True, color='#2ecc71', ax=ax4)
        ax4.set_title("Standarisasi Durasi Audio")
        st.pyplot(fig4)
        
    st.info("💡 **Insight:** Pipeline cleaning sukses membuat seluruh file seragam secara durasi (~1.0s) dan memiliki rentang RMS energy yang stabil antar kelompok kelas, mencegah bias model akibat perbedaan volume atau durasi yang ekstrem.")

# Page: Dampak Augmentasi
elif page == "Dampak Augmentasi":
    st.markdown('<div class="sub-header">Analisis Dampak Augmentasi (Q2)</div>', unsafe_allow_html=True)
    
    st.write("Membandingkan distribusi fitur akustik antara data original dan data yang telah ditambahkan noise/pitch shift/time stretch.")
    
    feature_to_compare = st.selectbox("Pilih Fitur untuk Dibandingkan:", 
                                     ["mfcc_1", "mfcc_2", "spectral_centroid", "zero_crossing_rate", "rms_energy"])
    
    # Buat kategori: Original vs Augmented
    df_features['is_augmented'] = df_features['augmentation_type'].apply(lambda x: 'Original' if x == 'original' else 'Augmented')
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # KDE Plot untuk melihat perbandingan distribusi
    sns.kdeplot(data=df_features, x=feature_to_compare, hue='is_augmented', 
                fill=True, common_norm=False, palette=['#1abc9c', '#e74c3c'], alpha=0.5, ax=ax)
    
    ax.set_title(f"Distribusi {feature_to_compare} (Original vs Augmented)", fontsize=16)
    st.pyplot(fig)
    
    col1, col2 = st.columns(2)
    with col1:
        st.write("**Statistik Original:**")
        st.dataframe(df_features[df_features['is_augmented'] == 'Original'][feature_to_compare].describe())
    with col2:
        st.write("**Statistik Augmented:**")
        st.dataframe(df_features[df_features['is_augmented'] == 'Augmented'][feature_to_compare].describe())
        
    st.success(f"💡 **Explanatory Analysis:** Meskipun terdapat pelebaran variansi (Std Dev meningkat) pada data augmented, yang merepresentasikan penambahan keberagaman data, pusat distribusinya (Mean) tetap serupa. Ini mengkonfirmasi hipotesis A/B test (Eksperimen 1 & 3) bahwa augmentasi yang dilakukan aman dan informatif tanpa merusak karakteristik sinyal (p-value > 0.05 pada mean diff).")

# Page: Diferensiasi Akustik
elif page == "Diferensiasi Akustik (A/B Test)":
    st.markdown('<div class="sub-header">Perbandingan Vokal vs Konsonan (Q3)</div>', unsafe_allow_html=True)
    
    st.write("Berdasarkan hasil A/B Testing (Eksperimen 2), kita membandingkan fitur akustik antara kelas Vokal dasar (A, I, U, E, O) dengan kelas Konsonan (Ba, Pa, Ma sets).")
    
    # Kolom Vokal vs Konsonan
    df_ab = df_features[df_features['is_augmented'] == 'Original'].copy()
    df_ab['tipe_kelas'] = df_ab['label'].apply(lambda x: 'Vokal' if x in vokal_labels else 'Konsonan')
    
    feat_x = st.selectbox("Pilih Fitur X (Kuat untuk diferensiasi):", 
                         ["zero_crossing_rate", "spectral_centroid", "spectral_flatness", "mfcc_1"])
    feat_y = st.selectbox("Pilih Fitur Y:", 
                         ["spectral_centroid", "zero_crossing_rate", "mfcc_2", "spectral_bandwidth"])
                         
    fig, ax = plt.subplots(figsize=(12, 7))
    sns.scatterplot(data=df_ab, x=feat_x, y=feat_y, hue='tipe_kelas', 
                    palette={'Vokal': '#e84393', 'Konsonan': '#0984e3'}, alpha=0.6, ax=ax)
    
    ax.set_title(f"Scatter Plot: {feat_x} vs {feat_y} (Vokal vs Konsonan)", fontsize=14)
    st.pyplot(fig)
    
    st.markdown("""
    ### 🔬 Hasil A/B Testing (Cohen's d Effect Size)
    Dari pengujian Mann-Whitney U Test dan Independent t-test yang dilakukan secara terpisah di pipeline, 
    fitur-fitur ini menunjukkan perbedaan sangat signifikan (p < 0.05) dengan Effect Size yang medium/besar:
    
    1. **Zero Crossing Rate (ZCR):** Kelas konsonan (khususnya plosif seperti P dan B) memiliki frekuensi getaran tinggi di awal pengucapan, menghasilkan ZCR yang lebih tinggi dibandingkan vokal yang merupakan suara periodik murni.
    2. **Spectral Centroid:** Vokal cenderung memiliki pusat energi di frekuensi menengah-rendah dibandingkan dengan beberapa elemen konsonan berdesis.
    3. **MFCC_1:** Berfungsi sebagai representasi energi spektral keseluruhan yang sangat berguna membedakan _timbre_ antara huruf vokal dengan bibir terbuka dan konsonan bilabial tertutup.
    """)