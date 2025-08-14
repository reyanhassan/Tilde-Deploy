// s3_handler.rs
use aws_sdk_s3::types::{Delete, ObjectIdentifier};
use aws_sdk_s3::Client;
use std::collections::HashMap;
use tokio::io::AsyncReadExt;

pub async fn copy_and_transform_files(aws_client: &Client,s3_bucket: &str,source_prefix: &str,destination_prefix: &str,replacements: &HashMap<String, String>,distro: Option<&str>) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    println!("📦 Starting copy from s3://{}/{}", s3_bucket, source_prefix);
    println!("--------------------------------------------------------");

    // Cloning replacements and adding distro (default "debian-12") to it
    let mut effective_replacements = replacements.clone();
    let distro_val = distro.unwrap_or("debian-12");
    effective_replacements.insert("__DISTRO__".to_string(), distro_val.to_string());

    let objects = aws_client
        .list_objects_v2()
        .bucket(s3_bucket)
        .prefix(source_prefix)
        .send()
        .await?;

    println!("🔍 Listing objects...");
    println!("--------------------------------------------------------");

    if let Some(contents) = objects.contents {
        println!("✅ Found {} objects", contents.len());
        println!("--------------------------------------------------------");

        for object in contents {
            if let Some(source_key) = object.key() {
                println!("➡️ Processing object: {}", source_key);
                println!("--------------------------------------------------------");

                let relative_path = source_key.strip_prefix(source_prefix).unwrap_or(source_key);
                let destination_key = format!("{}{}", destination_prefix, relative_path);

                if relative_path == "variables.tf" {
                    println!("✏️ Detected 'variables.tf', modifying before uploading...");
                    println!("--------------------------------------------------------");

                    match modify(
                        &aws_client,
                        &s3_bucket,
                        &source_key,
                        &effective_replacements,
                    )
                    .await
                    {
                        Ok(modified_bytes) => {
                            println!("⬆️ Uploading modified 'variable.tf' to destination...");
                            println!("--------------------------------------------------------");
                            if let Err(e) = aws_client
                                .put_object()
                                .bucket(s3_bucket)
                                .key(&destination_key)
                                .body(modified_bytes.into())
                                .send()
                                .await
                            {
                                eprintln!("❌ Failed to upload modified 'variable.tf': {}", e);
                                println!(
                                    "--------------------------------------------------------"
                                );
                                return Err(Box::new(e));
                            }
                            println!("✅ Modified 'variable.tf' uploaded successfully.");
                            println!("--------------------------------------------------------");
                        }
                        Err(e) => {
                            eprintln!("❌ Failed to modify 'variable.tf': {}", e);
                            println!("--------------------------------------------------------");
                            return Err(e);
                        }
                    }
                } else {
                    let copy_source = format!("{}/{}", s3_bucket, source_key);
                    println!("📁 From: {}", copy_source);
                    println!("--------------------------------------------------------");
                    println!("📂 To:   {}", destination_key);
                    println!("--------------------------------------------------------");

                    aws_client
                        .copy_object()
                        .bucket(s3_bucket)
                        .copy_source(copy_source)
                        .key(destination_key)
                        .send()
                        .await?;
                }
            }
        }
    } else {
        println!("⚠️ No objects found under prefix: {}", source_prefix);
        println!("--------------------------------------------------------");
    }

    Ok(())
}

pub async fn modify(aws_client: &Client,s3_bucket: &str,source_key: &str,replacements: &HashMap<String, String>) -> Result<Vec<u8>, Box<dyn std::error::Error + Send + Sync>> {
    println!("🛠️ Modifying file s3://{}/{}", s3_bucket, source_key);
    println!("--------------------------------------------------------");

    let object_output = aws_client
        .get_object()
        .bucket(s3_bucket)
        .key(source_key)
        .send()
        .await?;

    let mut body = object_output.body.into_async_read();
    let mut contents = String::new();
    body.read_to_string(&mut contents).await?;
    println!("✅ Downloaded file successfully");
    println!("--------------------------------------------------------");

    let mut modified_contents = contents.clone();
    for (placeholder, value) in replacements {
        println!("🔁 Replacing {} => {}", placeholder, value);
        println!();
        modified_contents = modified_contents.replace(placeholder, value);
        println!("📝 Modified variable.tf content:\n{}", modified_contents);
        println!("--------------------------------------------------------");
    }
    println!("✅ Applied modifications");
    println!("--------------------------------------------------------");

    Ok(modified_contents.into_bytes())
}


pub async fn delete_specific_deployment_folder(aws_client: &Client,s3_bucket: &str,project_prefix: &str) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    println!("🔍 Attempting to delete folder: {}", project_prefix);
    println!("--------------------------------------------------------");

    let folder_objects = aws_client
        .list_objects_v2()
        .bucket(s3_bucket)
        .prefix(project_prefix)
        .send()
        .await?;

    let to_delete: Vec<ObjectIdentifier> = folder_objects
        .contents()
        .iter()
        .filter_map(|obj| {
            obj.key().and_then(|k| {
                println!("🗑 Deleting: {}", k);
                println!("--------------------------------------------------------");
                ObjectIdentifier::builder().key(k).build().ok()
            })
        })
        .collect();

    if to_delete.is_empty() {
        println!("⚠ Folder is empty or no objects to delete.");
        println!("--------------------------------------------------------");
        return Ok(false);
    }

    aws_client
        .delete_objects()
        .bucket(s3_bucket)
        .delete(Delete::builder().set_objects(Some(to_delete)).build()?)
        .send()
        .await?;

    println!("✅ Deleted S3 folder: {}", project_prefix);
    println!("--------------------------------------------------------");
    Ok(true)
}