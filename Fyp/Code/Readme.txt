==================================================
                  SYSTEM SETUP GUIDE
==================================================

Follow the steps below to set up and run the system properly.

--------------------------------------------------
STEP 1: INSTALL RUST, TERRAFORM, NODE.JS, BUILD TOOLS, AND LIBRARIES
--------------------------------------------------

Before using the system, ensure that Rust, Terraform, Node.js, and necessary build tools are installed on your machine.

➤ Download Rust (via Rustup):  
   https://rustup.rs

➤ Download Node.js (LTS version recommended):  
   https://nodejs.org/en/download

➤ Download and install Terraform:  
   https://developer.hashicorp.com/terraform/downloads

➤ Install Build Tools for your operating system:
   - On Windows: Install Microsoft Build Tools (latest, e.g., 2022) via Visual Studio Installer → Select "Desktop development with C++"
   - On Linux/macOS: Install your OS's latest build toolchain (GCC/Clang, Make, etc.).

➤ Install the matching Operating System SDK:
   - Windows: Install the latest Windows 10 SDK or Windows 11 SDK (matching your OS version)
   - macOS/Linux: Install the system SDK/development headers.

➤ Required additional libraries:
   On Windows (using Chocolatey):
      choco install strawberryperl -y
      choco install golang -y
      choco install cmake nasm -y

   On Debian-based Linux:
      sudo apt install perl golang cmake nasm -y

✅ To verify installation, run these commands:

   rustc --version  
   node -v  
   terraform -v

💡 Important note about MSVC & SDK detection:
If you are on a fresh system (i.e., runing code for first time), Cargo will not automatically detect MSVC and the Windows SDK when running `cargo build` from a normal PowerShell or Command Prompt.
You must do this:

1. Open "Brokage service for self-hosted applications (CODE)" Folder in vscode, run the cmd terminal do:
   i. cd deploy/backend
   ii. "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" && cargo build

Replace the path with `Community` instead of `BuildTools` if you installed the full Visual Studio Community edition.

--------------------------------------------------
STEP 2: CONFIGURE ENVIRONMENT VARIABLES
--------------------------------------------------

1. Navigate to the backend folder:  
   cd backend

2. Create a `.env` file inside the backend folder.

3. Paste the following into the `.env` file and replace the placeholders:

   AWS_ACCESS_KEY_ID=<your AWS access key ID>  
   AWS_SECRET_ACCESS_KEY=<your AWS secret access key>  
   AWS_REGION=<your AWS S3 bucket region>  
   S3_BUCKET=<your AWS S3 bucket name>  

   MONGO_URI=<your MongoDB Atlas URI>  

--------------------------------------------------
STEP 3: UPDATE CONFIGURATION FILE
--------------------------------------------------

1. Go to the `config` folder present inside the backend folder.

2. Open the `production.json` file.

3. Replace the placeholder in the file as shown below:

{
  "mongo_uri": "<your MongoDB Atlas URI>",
  "aws_region": "env",
  "s3_bucket": "env"
}

💡 NOTE:  
Do not change `"aws_region"` and `"s3_bucket"`, they are loaded from your `.env` file.

--------------------------------------------------
STEP 4: PREPARE YOUR S3 BUCKET
--------------------------------------------------

1. Log in to your AWS account and create a new S3 bucket (or use an existing one).

2. Upload the contents of the `deployment` folder into this bucket.

   The `deployment` folder contains:
   - compose
   - script
   - terraform

3. Upload these three folders directly to the root of the bucket.

🚫 Do NOT create any extra folders or subdirectories.

✅ Your bucket structure must look exactly like this:

   <your-bucket-name>/compose  
   <your-bucket-name>/script  
   <your-bucket-name>/terraform

❗ Incorrect placement (e.g., putting folders inside another folder i.e., nested folders) will break the system.

--------------------------------------------------
STEP 5: CHOOSE HOW TO RUN THE SYSTEM
--------------------------------------------------

You can run the system in two ways:

===========================
OPTION A: USING DOCKER (RECOMMENDED)
===========================
1. First, navigate to the deploy directory:
   cd deploy

2. To run the system using Docker Compose, ensure the following prerequisites are met:

>>> PREREQUISITES <<<

- Docker must be installed
- Docker network `deploy_net` must exist

--- On Debian-based Linux ---

1. Remove any conflicting packages:
   for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done

2. Install Docker:
   curl -fsSL https://get.docker.com | sudo sh

3. Create the network if it does not already exist:
   sudo docker network ls | grep -q deploy_net || sudo docker network create deploy_net

4. Start the dev server:
   sudo docker compose up -d

--- On Windows ---

1. Install Docker Desktop:  
   https://docs.docker.com/desktop/install/windows-install/

2. Create the Docker network:
   docker network create deploy_net

3. Start the dev server:
   docker compose up -d

🎉 Docker will automatically:
- Set up the environment  
- Build the backend  
- Launch the frontend  

===========================
OPTION B: RUNNING LOCALLY (WITHOUT DOCKER)
===========================

If you're not using Docker, follow these steps to run the backend and frontend manually:

--- Backend Setup ---

1. Navigate to the backend folder:  
   cd backend

2. Build the backend using Cargo:  
   cargo build

3. Run the backend server:  
   cargo run

--- Frontend Setup ---

1. Open a new terminal window.

2. Navigate to the frontend folder:  
   cd frontend

3. Install dependencies:  
   npm install

4. Start the development server:  
   npm run dev

✅ The frontend should now connect to your running backend server.

--------------------------------------------------
🎯 YOU ARE NOW READY TO USE THE SYSTEM!
--------------------------------------------------
