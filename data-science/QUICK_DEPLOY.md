# ⚡ QUICK DEPLOY - Streamlit dalam 5 Menit

Cara paling cepat untuk deploy Heartz Dashboard agar bisa diakses publik.

---

## 🎯 OPTION 1: LOCAL TESTING (5 menit)

### ✅ Step 1: Siapkan Virtual Environment

```bash
cd c:\Users\rafig\Heartz\data-science
.venv\Scripts\Activate.ps1  # Activate venv
```

### ✅ Step 2: Update Dependencies

```bash
pip install -r requirements.txt
```

**Cek:** Streamlit sudah install?

```bash
streamlit --version
# Output: Streamlit, version 1.28.0 (atau lebih tinggi)
```

### ✅ Step 3: Jalankan Dashboard

```bash
streamlit run app.py
```

**Expected Output:**

```
  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://192.168.1.100:8501
```

### ✅ Step 4: Buka di Browser

- **Local access:** http://localhost:8501
- **Network access:** Gunakan Network URL (dari device lain di WiFi yang sama)

**Result:** ✅ Dashboard running lokal!

---

## 🌐 OPTION 2: STREAMLIT CLOUD DEPLOYMENT (10 menit - RECOMMENDED)

**Ini cara terbaik untuk publik access!**

### ✅ Step 1: Push Code ke GitHub

```bash
cd c:\Users\rafig\Heartz

# Check status
git status

# Add & commit
git add .
git commit -m "Finalize streamlit dashboard for deployment"

# Push to branch
git push origin ds-geo
```

### ✅ Step 2: Buka Streamlit Cloud

1. Pergi ke: **https://share.streamlit.io/**
2. Click tombol **"Create app"**

### ✅ Step 3: Setup Deployment

Di form, isi:

| Field              | Value               |
| ------------------ | ------------------- |
| **GitHub repo**    | ghildnsy/Heartz     |
| **Branch**         | ds-geo              |
| **Main file path** | data-science/app.py |

### ✅ Step 4: Deploy!

Click tombol **"Deploy"** → Wait 3-5 minutes

### 🎉 Result

- **Public URL:** `https://heartz-ghildnsy.streamlit.app/`
- **Accessible:** Semua orang (tidak perlu login)
- **Update:** Otomatis saat push ke GitHub (2-3 menit)

**Share URL ini ke team/stakeholders!**

---

## 📝 AFTER DEPLOYMENT: Making Updates

### Update Dashboard

```bash
# Edit app.py
nano app.py

# Commit & push
git add app.py
git commit -m "Update dashboard visualization"
git push origin ds-geo

# Streamlit Cloud auto-updates dalam 2-3 menit
```

**No manual redeploy needed!** ✅

---

## ✅ VERIFICATION CHECKLIST

Before proceeding:

- [ ] Virtual environment activated (`.venv\Scripts\Activate.ps1`)
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Streamlit runs lokal (`streamlit run app.py`)
- [ ] App accessible di http://localhost:8501
- [ ] Code pushed ke GitHub (`git push origin ds-geo`)

---

## 🎯 NEXT STEPS

### Local Testing

```bash
streamlit run app.py
# Access: http://localhost:8501
# Press Ctrl+C to stop
```

### Public Deployment

```bash
# 1. Push code
git push origin ds-geo

# 2. Deploy via https://share.streamlit.io/
# 3. Share public URL dengan team
```

---

## 📊 STATUS

| Step                   | Status    | Time           |
| ---------------------- | --------- | -------------- |
| Local setup            | ✅ Ready  | 5 min          |
| Streamlit Cloud deploy | ✅ Ready  | 10 min         |
| Auto-update feature    | ✅ Active | 2-3 min/update |

**Result:** 🚀 Dashboard accessible publik!

---

## 🆘 TROUBLESHOOTING

### "Error: Invalid value: file does not exist: app.py"

```bash
# ✅ Benar
cd data-science
streamlit run app.py

# ❌ Salah
cd ..
streamlit run app.py  # Wrong folder!
```

### "ModuleNotFoundError"

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Streamlit Cloud deploy stuck

1. Refresh page: https://share.streamlit.io/
2. Check GitHub branch: `ds-geo`
3. Verify file path: `data-science/app.py`

---

## 📞 More Help

- **Full Guide:** [STREAMLIT_DEPLOY.md](STREAMLIT_DEPLOY.md)
- **Local Setup:** [FINALIZATION.md](FINALIZATION.md)
- **Dashboard Code:** [app.py](app.py)

---

**Happy deploying! 🫀🚀**
