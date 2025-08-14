use actix_web::{web, HttpResponse, Responder};
use std::collections::HashMap;
use aws_config::BehaviorVersion;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    app_config::AppConfig,
    s3_handler::{copy_and_transform_files, delete_specific_deployment_folder},
    utils::database::db::{store_deployment_metadata, find_user_by_email, delete_deployment, fetch_cloud_provider},
    utils::user::signup_func::init_mongo_client,
    terraform_handler::{execute_deployment,destroy_terraform_resources},
};

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "snake_case")]
pub struct DeploymentRequest {
    pub project_name: String,
    pub selected_service: String,
    pub selected_server: String,
    pub region: String,
    pub volume_size: u32,
    pub ip_option: String,
    pub ssh_key_option: Option<String>,
    pub ssh_key: Option<String>,
    pub terraform_template: String,
    pub user_email: String,
}

#[derive(Serialize)]
pub struct ApiResponse {
    pub status: String,
    pub message: String,
    pub returneddata: Option<serde_json::Value>,
}

#[derive(Deserialize, Debug)]
pub struct UndeployRequest {
    pub user_email: String,      
    pub project_id: String,   
    pub project_name: String, 
}

pub fn validate_request(data: &DeploymentRequest) -> Result<(), String> {
    if data.project_name.trim().is_empty() {
        return Err("Project name is required".into());
    }

    let valid_services = ["AWS", "Azure", "GCP"];
    if !valid_services.contains(&data.selected_service.as_str()) {
        return Err("Invalid cloud service selected".into());
    }

    if data.volume_size == 0 {
        return Err("Volume size must be greater than 0".into());
    }

    let valid_ip_options = ["reserved", "dynamic"];
    if !valid_ip_options.contains(&data.ip_option.as_str()) {
        return Err("Invalid IP option selected".into());
    }

    if data.ssh_key_option == Some("existing".into()) && data.ssh_key.is_none() {
        return Err("SSH key is required when using 'existing'".into());
    }

    Ok(())
}

pub async fn deploy(app_data: web::Data<AppConfig>, deploymentrequest: web::Json<DeploymentRequest>) -> impl Responder {
    println!("📥 Received deploy request: {:?}", deploymentrequest);

    // Validate request fields
    if let Err(err_msg) = validate_request(&deploymentrequest) {
        println!("❌ Validation failed: {}", err_msg);
        return HttpResponse::BadRequest().json(ApiResponse {
            status: "error".into(),
            message: err_msg,
            returneddata: None,
        });
    }

    // Initialize MongoDB client early to check user existence
    let mongo_client = init_mongo_client().await;

    // Check if user exists by email
    match find_user_by_email(mongo_client.clone(), &deploymentrequest.user_email).await {
        Ok(Some(_user_doc)) => {
            println!("✅ User found, proceeding with deployment");
        }
        Ok(None) => {
            println!("❌ User with email '{}' not found", deploymentrequest.user_email);
            return HttpResponse::BadRequest().json(ApiResponse {
                status: "error".into(),
                message: format!("User with email '{}' not found", deploymentrequest.user_email),
                returneddata: None,
            });
        }
        Err(e) => {
            eprintln!("❌ Error querying user: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse {
                status: "error".into(),
                message: "Internal server error while verifying user".into(),
                returneddata: None,
            });
        }
    }

    // ✅ Fetch cloud provider key and store it
    let cloud_provider = match fetch_cloud_provider(&deploymentrequest.user_email).await {
        Ok(cloud_key) => {
            println!("✅ Cloud provider key found !");
            cloud_key
        }
        Err(e) => {
            eprintln!("❌ Cloud provider error: {}", e);
            return HttpResponse::BadRequest().json(ApiResponse {
                status: "error".into(),
                message: "Cloud provider not set for this user. Cannot proceed with deployment.".into(),
                returneddata: None,
            });
        }
    };

    println!("--------------------------------------------------------");
    println!("✅ Passed validation and user check");
    println!("--------------------------------------------------------");

    let project_id = Uuid::new_v4().to_string();
    let bucket = &app_data.s3_bucket;
    let source_prefix = format!("terraform/{}/", deploymentrequest.terraform_template);
    let destination_prefix = format!("deployments/{} (project_id: {})/", deploymentrequest.project_name, project_id);

    let mut replacements = HashMap::new();
    replacements.insert("__NODE_NAME__".to_string(), format!("{}-server", deploymentrequest.project_name));
    replacements.insert("__SERVER_TYPE__".to_string(), deploymentrequest.selected_server.clone());
    replacements.insert("__LOCATION__".to_string(), deploymentrequest.region.clone());
    replacements.insert("__HCLOUD_TOKEN__".to_string(), cloud_provider.clone());


    let aws_config = aws_config::load_defaults(BehaviorVersion::latest()).await;
    let s3_client = aws_sdk_s3::Client::new(&aws_config);

    // Copy and transform Terraform files in S3
    if let Err(e) = copy_and_transform_files(&s3_client, &bucket, &source_prefix, &destination_prefix, &replacements, None).await {
        eprintln!("❌ S3 copy error: {}", e);
        return HttpResponse::InternalServerError().json(ApiResponse {
            status: "error".into(),
            message: "Failed to copy and modify templates from S3".into(),
            returneddata: None,
        });
    }

    println!("✅ S3 templates copied to: {}", destination_prefix);
    println!("--------------------------------------------------------");

    // Now call execute_deployment to download, apply terraform etc.
    if let Err(e) = execute_deployment(&s3_client, bucket, &destination_prefix).await {
        eprintln!("❌ Deployment execution error: {}", e);
        return HttpResponse::InternalServerError().json(ApiResponse {
            status: "error".into(),
            message: format!("Failed during deployment execution: {}", e),
            returneddata: None,
        });
    }

    let deployment_data = deploymentrequest.into_inner();

    if let Err(resp) = store_deployment_metadata(mongo_client.clone(), &deployment_data, &project_id).await {
        return resp;
    }

    HttpResponse::Ok().json(ApiResponse {
        status: "success".into(),
        message: "✅ Deployment initialized and executed".into(),
        returneddata: None,
    })
}

pub async fn undeploy(app_data: web::Data<AppConfig>,request: web::Json<UndeployRequest>) -> impl Responder {
    
    println!("📥 Received undeploy request: {:?}", request);
    println!("--------------------------------------------");

    // Validate required fields
    if request.user_email.trim().is_empty() || request.project_id.trim().is_empty() {
        return HttpResponse::BadRequest().json(ApiResponse {
            status: "error".into(),
            message: "user_email and project_id are required".into(),
            returneddata: None,
        });
    }

    let mongo_client = init_mongo_client().await;

    // Lookup user by email to get user_id (ObjectId)
    let user_doc_result = find_user_by_email(mongo_client.clone(), &request.user_email).await;

    let user_doc = match user_doc_result {
        Ok(Some(doc)) => doc,
        Ok(None) => {
            return HttpResponse::BadRequest().json(ApiResponse {
                status: "error".into(),
                message: format!("User with email '{}' not found", request.user_email),
                returneddata: None,
            });
        }
        Err(e) => {
            eprintln!("❌ Error finding user by email: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse {
                status: "error".into(),
                message: "Internal server error while looking up user".into(),
                returneddata: None,
            });
        }
    };

    // Extract ObjectId of user
    let user_id = match user_doc.get_object_id("_id") {
        Ok(oid) => oid,
        Err(_) => {
            return HttpResponse::InternalServerError().json(ApiResponse {
                status: "error".into(),
                message: "Failed to extract user ID from user document".into(),
                returneddata: None,
            });
        }
    };
    let user_id_str = user_id.to_hex();

    // Build the S3 prefix of the deployment to destroy and delete
    let bucket = &app_data.s3_bucket;
    let prefix_to_delete = format!(
        "deployments/{} (project_id: {})/",
        request.project_name, request.project_id
    );

    // Initialize AWS S3 client
    let aws_config = aws_config::load_defaults(BehaviorVersion::latest()).await;
    let s3_client = aws_sdk_s3::Client::new(&aws_config);

    // Step 1: Destroy Terraform resources
    match destroy_terraform_resources(&s3_client, bucket, &prefix_to_delete).await {
        Ok(_) => {
            println!("✅ Terraform destroy completed successfully.");
            println!("--------------------------------------------");
        }
        Err(e) => {
            eprintln!("❌ Terraform destroy failed: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse {
                status: "error".into(),
                message: format!("Failed to destroy Terraform resources: {}", e),
                returneddata: None,
            });
        }
    }

    // Step 2: Delete deployment folder from S3
    match delete_specific_deployment_folder(&s3_client, bucket, &prefix_to_delete).await {
        Ok(true) => {
            println!("✅ Deployment folder deleted from S3.");
            println!("--------------------------------------------");

            // Step 3: Delete deployment metadata from MongoDB
            match delete_deployment(mongo_client.clone(), &user_id_str, &request.project_id).await {
                Ok(resp) => resp,
                Err(err_resp) => err_resp,
            }
        }
        Ok(false) => {
            println!("⚠ No files found in S3 to delete.");
            HttpResponse::NotFound().json(ApiResponse {
                status: "error".into(),
                message: "No files found in S3 for the given project_id".into(),
                returneddata: None,
            })
        }
        Err(e) => {
            eprintln!("❌ S3 deletion error: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse {
                status: "error".into(),
                message: format!("Failed to delete deployment files from S3: {}", e),
                returneddata: None,
            })
        }
    }
}