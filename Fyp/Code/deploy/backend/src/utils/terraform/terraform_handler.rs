use std::fs;
use tokio::fs as async_fs;
use std::path::PathBuf;
use std::path::Path;
use aws_sdk_s3::{Client, primitives::ByteStream};
use regex::Regex;
use tokio::process::Command;
use tokio::io::{AsyncBufReadExt, BufReader, AsyncWriteExt, AsyncReadExt};
use async_recursion::async_recursion;

pub fn create_project_temp_folder(project_name: &str,project_id: &str) -> Result<PathBuf, Box<dyn std::error::Error + Send + Sync>> {
    let folder_name = format!("{} (project_id= {})", project_name, project_id);

    // Get current working directory (project root)
    let project_root = std::env::current_dir()?;
    
    // Create path under project root
    let temp_dir = project_root.join("terraform-temp").join(folder_name);

    fs::create_dir_all(&temp_dir)?;

    println!("📁 Created local temp folder: {}", temp_dir.display());
    println!("---------------------------------------------");

    Ok(temp_dir)
}


pub async fn download_terraform_folder_from_s3(aws_client: &Client,s3_bucket: &str,source_prefix: &str) -> Result<PathBuf, Box<dyn std::error::Error + Send + Sync>> {

    println!("📥 Downloading from S3: {}/{}", s3_bucket, source_prefix);
    println!("--------------------------------------------------------");

    // Extract project name and project ID from prefix using regex
    let re = Regex::new(r"deployments/(.+?) \(project_id: (.+?)\)/")?;
    let caps = re
        .captures(source_prefix)
        .ok_or("❌ Failed to parse project name and ID from prefix")?;

    let project_name = caps.get(1).unwrap().as_str();
    let project_id = caps.get(2).unwrap().as_str();

    // Create local temp directory for this project
    let temp_dir = create_project_temp_folder(project_name, project_id)?;
    println!("📁 Created local temp folder: {}", temp_dir.display());
    println!("--------------------------------------------------------");

    // List objects in S3 prefix
    let objects = aws_client
        .list_objects_v2()
        .bucket(s3_bucket)
        .prefix(source_prefix)
        .send()
        .await?;

    if let Some(contents) = objects.contents {
        println!("🔍 Found {} objects to download", contents.len());
        for obj in contents {
            if let Some(key) = obj.key() {
                let relative_path = key.strip_prefix(source_prefix).unwrap_or(key);
                if relative_path.is_empty() {
                    continue;
                }

                let local_path = temp_dir.join(relative_path);
                if let Some(parent) = local_path.parent() {
                    std::fs::create_dir_all(parent)?;
                }

                println!("⬇ Downloading: {} → {}", key, local_path.display());

                let obj_output = aws_client
                    .get_object()
                    .bucket(s3_bucket)
                    .key(key)
                    .send()
                    .await?;

                let mut stream: ByteStream = obj_output.body;
                let mut file = async_fs::File::create(&local_path).await?;

                while let Some(bytes) = stream.try_next().await? {
                    file.write_all(&bytes).await?;
                }

                println!("✅ Downloaded: {}", local_path.display());
                println!("--------------------------------------------------------");
            }
        }
    } else {
        println!("⚠️ No files found in S3 prefix: {}", source_prefix);
    }

    println!("📁 All files downloaded to: {}", temp_dir.display());
    println!("--------------------------------------------------------");
    Ok(temp_dir)
}

#[async_recursion]
pub async fn upload_terraform_folder_recursive(aws_client: &Client,s3_bucket: &str,s3_prefix: &str,local_dir: &Path) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Walk directory recursively
    let mut entries = async_fs::read_dir(local_dir).await?;

    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();

        if path.is_dir() {
            // Recursively upload subdirectory
            let relative_path = path.strip_prefix(local_dir)?;
            let new_prefix = format!(
                "{}/{}",
                s3_prefix.trim_end_matches('/'),
                relative_path.to_string_lossy()
            );
            upload_terraform_folder_recursive(aws_client, s3_bucket, &new_prefix, &path).await?;
        } else if path.is_file() {
            let relative_path = path.strip_prefix(local_dir)?;
            let s3_key = format!(
                "{}/{}",
                s3_prefix.trim_end_matches('/'),
                relative_path.to_string_lossy()
            );

            println!("📤 Uploading file: {} → s3://{}/{}", path.display(), s3_bucket, s3_key);

            let mut file = async_fs::File::open(&path).await?;
            let mut contents = Vec::new();
            file.read_to_end(&mut contents).await?;

            aws_client
                .put_object()
                .bucket(s3_bucket)
                .key(&s3_key)
                .body(ByteStream::from(contents))
                .send()
                .await?;
        }
    }

    Ok(())
}


pub async fn run_terraform_execute_commands(working_dir: &Path) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    
    println!("🚀 Starting Terraform commands in: {}", working_dir.display());
    println!("--------------------------------------------------------");

    // Helper function to run a command and stream output line by line
    async fn run_command(command: &mut Command) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut child = command.stdout(std::process::Stdio::piped()).stderr(std::process::Stdio::piped()).spawn()?;
        
        if let Some(stdout) = &mut child.stdout {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();

            while let Some(line) = lines.next_line().await? {
                println!("🌱 {}", line);
            }
        }
        
        let status = child.wait().await?;
        if !status.success() {
            return Err(format!("Command failed with status: {}", status).into());
        }

        Ok(())
    }

    // terraform init
    println!("🔧 Running 'terraform init'...");
    run_command(Command::new("terraform").arg("init").current_dir(working_dir)).await?;

    // terraform plan -out=tfplan
    println!("🔧 Running 'terraform plan'...");
    run_command(Command::new("terraform").arg("plan").current_dir(working_dir)).await?;

    // terraform apply -auto-approve
    println!("🔧 Running 'terraform apply'...");
    run_command(Command::new("terraform").arg("apply").arg("-auto-approve").current_dir(working_dir)).await?;

    println!("✅ Terraform commands completed successfully.");
    println!("--------------------------------------------------------");

    Ok(())
}


pub async fn run_destroy_command(working_dir: &Path) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    
    println!("🔧 Running 'terraform destroy' in: {}", working_dir.display());
    println!("--------------------------------------------------------");

    let mut child = Command::new("terraform")
        .arg("destroy")
        .arg("-auto-approve")
        .current_dir(working_dir)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;

    if let Some(stdout) = &mut child.stdout {
        let reader = BufReader::new(stdout);
        let mut lines = reader.lines();

        while let Some(line) = lines.next_line().await? {
            println!("🔥 {}", line);
            println!("--------------------------------------------------------");
        }
    }

    let status = child.wait().await?;
    if !status.success() {
        return Err(format!("Terraform destroy failed with status: {}", status).into());
    }

    println!("✅ Terraform destroy completed successfully.");
    println!("--------------------------------------------------------");

    // Clean up local temp folder after destroy finishes
    println!("🧹 Cleaning up local temp folder: {}", working_dir.display());
    println!("--------------------------------------------------------");

    if let Err(e) = async_fs::remove_dir_all(working_dir).await {
        eprintln!("⚠️ Failed to delete local temp folder {}: {}", working_dir.display(), e);
        println!("--------------------------------------------------------");
    }
    
    Ok(())
}

pub async fn execute_deployment(aws_client: &Client,s3_bucket: &str,s3_prefix: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    println!("🔄 Starting deployment execution flow for: {}", s3_prefix);
    println!("--------------------------------------------------------");

    // Step 1: Download the Terraform folder from S3 to local temp folder
    let local_dir = download_terraform_folder_from_s3(aws_client, s3_bucket, s3_prefix).await?;
    println!("✅ Downloaded Terraform folder locally at: {}", local_dir.display());
    println!("--------------------------------------------------------");

    // Step 2: Run Terraform commands (init, plan, apply)
    if let Err(e) = run_terraform_execute_commands(&local_dir).await {
        eprintln!("❌ Deployment execution error: {}", e);
        println!("--------------------------------------------------------");
        return Err(e);
    }

    // Step 3: Upload terraform.tfstate and .terraform.lock.hcl to same S3 folder
    println!("📤 Uploading terraform outputs (.tfstate + .lock.hcl) to S3: {}", s3_prefix);
    println!("--------------------------------------------------------");

    if let Err(e) = upload_terraform_folder_recursive(aws_client, s3_bucket, s3_prefix, &local_dir).await {
        eprintln!("❌ Upload error: {}", e);
        println!("--------------------------------------------------------");
        return Err(e);
    }

    println!("✅ Output files uploaded successfully to S3.");
    println!("--------------------------------------------------------");

    // Step 4: Clean up local folder
    println!("🧹 Cleaning up local temp folder: {}", local_dir.display());
    println!("--------------------------------------------------------");

    if let Err(e) = async_fs::remove_dir_all(&local_dir).await {
        eprintln!("⚠️ Failed to delete local temp folder {}: {}", local_dir.display(), e);
    }

    Ok(())
}


pub async fn destroy_terraform_resources(aws_client: &Client,s3_bucket: &str,s3_prefix: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    
    println!("🧨 Starting Terraform destroy flow for: {}", s3_prefix);
    println!("--------------------------------------------------------");

    // Step 1: Download Terraform folder from S3
    let local_dir = download_terraform_folder_from_s3(aws_client, s3_bucket, s3_prefix).await?;
    println!("✅ Downloaded Terraform folder locally at: {}", local_dir.display());
    println!("--------------------------------------------------------");

    // Step 2: Run terraform destroy
    if let Err(e) = run_destroy_command(&local_dir).await {
        eprintln!("❌ Terraform destroy error: {}", e);
        println!("--------------------------------------------------------");
        return Err(e);
    }

    println!("✅ Terraform resources destroyed successfully for: {}", s3_prefix);
    println!("--------------------------------------------------------");


   

    Ok(())
}