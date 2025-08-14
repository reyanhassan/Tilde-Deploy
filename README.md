<!-- PROJECT BANNER -->
<p align="center">
  <img src="https://img.shields.io/badge/Project-Brokerage_Service_for_Self_Hosted_Apps-blue?style=for-the-badge&logo=appveyor" alt="Project Badge">
  <img src="https://img.shields.io/badge/Backend-Rust-orange?style=for-the-badge&logo=rust" alt="Rust">
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/IaC-Terraform-7B42BC?style=for-the-badge&logo=terraform" alt="Terraform">
  <img src="https://img.shields.io/badge/Cloud-AWS-yellow?style=for-the-badge&logo=amazonaws" alt="AWS">
</p>

<p align="center">
  <img src="E:\tilde_deploy_fyp\Fyp\Logo\WhatsApp Image 2025-07-28 at 20.02.49_8ada87dd.jpg" alt="Tilde Logo" width="300">
</p>


<h1 align="center">🚀 Brokerage Service for Self-Hosted Applications</h1>
<p align="center">
  Automated deployment platform for self-hosted apps using Rust backend, Terraform, and AWS S3.
</p>

---

## 📋 Table of Contents
1. [Install Requirements](#1️⃣-install-rust-terraform-nodejs-build-tools-and-libraries)
2. [Configure Environment Variables](#2️⃣-configure-environment-variables)
3. [Update Configuration File](#3️⃣-update-configuration-file)
4. [Prepare S3 Bucket](#4️⃣-prepare-your-s3-bucket)
5. [Run the System](#5️⃣-choose-how-to-run-the-system)

---

## 1️⃣ Install Rust, Terraform, Node.js, Build Tools, and Libraries

Before using the system, ensure the following are installed:

- **Rust (via Rustup)** → [https://rustup.rs](https://rustup.rs)  
- **Node.js (LTS)** → [https://nodejs.org/en/download](https://nodejs.org/en/download)  
- **Terraform** → [https://developer.hashicorp.com/terraform/downloads](https://developer.hashicorp.com/terraform/downloads)  

---

### 🖥 Build Tools
**Windows** → Install **Microsoft Build Tools (2022)** via Visual Studio Installer → Select *Desktop development with C++*.  
**Linux/macOS** → Install GCC/Clang, Make, and related build tools.

---

### 📦 OS SDK
- **Windows** → Install Windows 10/11 SDK  
- **Linux/macOS** → Install system SDK/dev headers.

---

### 📚 Additional Libraries

**Windows (Chocolatey)**
```powershell
choco install strawberryperl -y
choco install golang -y
choco install cmake nasm -y
```

**Debian-based Linux**
```bash
sudo apt install perl golang cmake nasm -y
```

---

### ✅ Verify Installation
```bash
rustc --version
node -v
terraform -v
```

---

### 💡 Important (Windows MSVC/SDK Detection)
If Cargo doesn’t detect MSVC/SDK:

```cmd
cd deploy/backend
"C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" && cargo build
```
> Replace `BuildTools` with `Community` if using VS Community Edition.

---

## 2️⃣ Configure Environment Variables
```bash
cd backend
```

Create `.env` in the backend folder:
```env
AWS_ACCESS_KEY_ID=<your AWS access key ID>
AWS_SECRET_ACCESS_KEY=<your AWS secret access key>
AWS_REGION=<your AWS S3 bucket region>
S3_BUCKET=<your AWS S3 bucket name>

MONGO_URI=<your MongoDB Atlas URI>
```

---

## 3️⃣ Update Configuration File
Edit `backend/config/production.json`:
```json
{
  "mongo_uri": "<your MongoDB Atlas URI>",
  "aws_region": "env",
  "s3_bucket": "env"
}
```
💡 Do **not** change `aws_region` or `s3_bucket` — they load from `.env`.

---

## 4️⃣ Prepare Your S3 Bucket

1. Create an S3 bucket (or use an existing one).
2. Upload **contents** of the `deployment` folder:
   - `compose`
   - `script`
   - `terraform`

✅ **Correct Structure**
```
<your-bucket-name>/compose
<your-bucket-name>/script
<your-bucket-name>/terraform
```
🚫 **Incorrect**
```
<your-bucket-name>/deployment/compose
```

---

## 5️⃣ Choose How to Run the System

### 🅰 Option A: Using Docker (Recommended)
```bash
cd deploy
```

**Debian-based Linux**
```bash
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
curl -fsSL https://get.docker.com | sudo sh
sudo docker network ls | grep -q deploy_net || sudo docker network create deploy_net
sudo docker compose up -d
```

**Windows**
```powershell
docker network create deploy_net
docker compose up -d
```

🎉 Docker will set up the environment, build the backend, and launch the frontend.

---

### 🅱 Option B: Running Locally

**Backend**
```bash
cd backend
cargo build
cargo run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

✅ The frontend will connect to your backend.

---

🎯 **You are now ready to use the system!**
