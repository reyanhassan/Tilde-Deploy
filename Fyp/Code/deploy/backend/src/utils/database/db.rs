use actix_web::HttpResponse;
use bcrypt::verify;
use chrono::{Utc, Duration as ChronoDuration};
use futures::stream::TryStreamExt;
use mongodb::{
    bson::{doc, oid::ObjectId, Document, DateTime as BsonDateTime, Bson},
    options::{ClientOptions, IndexOptions as CreateIndexOptions},
    Client, Collection, IndexModel,
};

use serde::Deserialize;
use std::error::Error;
use std::fs;

use crate::{deploy::ApiResponse, utils::{settings::cloudprovider::ProviderRequest, user::signup_func::init_mongo_client}};
use crate::utils::deployment::deploy::DeploymentRequest;


#[derive(Deserialize)]
struct Config {
    mongo_uri: String,
}

pub async fn create_session(session_token: &str,email: &str,client: &Client) -> Result<(), mongodb::error::Error> {
    
    let collection = client.database("deploy").collection("sessions");
    let session = doc! {
        "session_token": session_token,
        "email": email,
        "created_at": BsonDateTime::now(),
        "expires_at": BsonDateTime::from_system_time((Utc::now() + ChronoDuration::days(7)).into()), 
    };
    collection.insert_one(session, None).await?;
    Ok(())
}

pub async fn validate_session(session_id: &str,client: &Client,) -> Option<String> {

    // let doc = session?;
    let collection = client.database("deploy").collection::<Document>("sessions");

    let session = match collection.find_one(doc! {"session_token": session_id}, None).await{
        Ok(Some(doc)) => doc,
        _ => return None,
    };

    let expires_at = session.get_datetime("expires_at").ok()?;
    if *expires_at < BsonDateTime::from_system_time(Utc::now().into()) {
        return None;
    }

    session.get_str("email").ok().map(|s| s.to_string())
}

pub async fn create_indexes(client: &Client) {
    let collection = client.database("deploy").collection::<Document>("sessions");
    
    // TTL index for automatic session expiration
    let ttl_options = Some(
        CreateIndexOptions::builder()
            .expire_after(std::time::Duration::from_secs(0))  // Using std::time::Duration
            .build()
    );

    let ttl_index = IndexModel::builder()
        .keys(doc! { "expires_at": 1 })
        .options(ttl_options)
        .build();
    
    collection.create_index(
        ttl_index,None
    ).await.expect("Failed to create TTL index");

    let unique_options = Some(
        CreateIndexOptions::builder()
            .unique(true)
            .build()
    );
    
    // Unique index for session tokens
    let unique_index = IndexModel::builder()
        .keys(doc! { "session_token": 1 })
        .options(
            unique_options
        )
        .build();
    
    collection.create_index(
        unique_index, None
    ).await.expect("Failed to create session token index");
}


pub async fn add_user_data(mongo_client: Client, new_user: Document) -> Result<ObjectId, Box<dyn std::error::Error>>
{
    let mongo_database= mongo_client.database("deploy");
    let user_collection = mongo_database.collection("users");
    
    let email_value = new_user.get_str("email").expect("Email should be validated before calling this function");

    // 1. Initializing validation for new user data
    let user = find_user_by_email(mongo_client.clone(), email_value).await?;
    if user.is_some() {
        return Err("User with this email already exists".into());
    }
    
    // 4. Inserting new user into MongoDB
    let insert_result = user_collection.insert_one(new_user, None).await?;

    // 5. Creating auto-generated ObjectId for the user
    let user_id = insert_result.inserted_id.as_object_id().ok_or("Failed to get inserted user ID")?;

    Ok(user_id)
}


pub async fn find_user_by_email(mongo_client: Client, email: &str) -> Result<Option<mongodb::bson::Document>, Box<dyn Error>> {
    let mongo_database = mongo_client.database("deploy");
    let user_collection = mongo_database.collection("users");

    // Finding user by email
    let filter = doc! { "email": email };
    let user = user_collection.find_one(filter, None).await?;

    Ok(user)
}

pub async fn verify_user(mongo_client: Client, email: &str, password: &str) -> Result<Option<mongodb::bson::Document>, Box<dyn Error>> {
    let user_result = find_user_by_email(mongo_client.clone(), email).await?;

    if let Some(user_doc) = user_result {
        let hashed_password = user_doc.get_str("password").map_err(|_| "Password field is missing")?;
        let is_valid = verify(password, hashed_password).map_err(|_| "Error while verifying password")?;

        if is_valid {
            // Verifying password and returning user document
            return Ok(Some(user_doc));
        }
    }
    // User not found or password is invalid
    Ok(None)
}

pub async fn get_deployments_by_user_id(mongo_client: Client, user_id: &ObjectId) -> Result<Vec<mongodb::bson::Document>, Box<dyn Error>> {
    let mongo_database = mongo_client.database("deploy");
    let deployment_collection = mongo_database.collection::<mongodb::bson::Document>("deployments");

    let filter = doc! { "user_id": user_id };
    let mut cursor = deployment_collection.find(filter, None).await?;

    let mut deployments = Vec::new();
    while let Some(doc) = cursor.try_next().await? {
        deployments.push(doc);
    }

    Ok(deployments)
}


pub async fn connect_to_mongo() -> Result<Client, Box<dyn Error>> {
    // Loading and parsing the config JSON file
    let config_str = fs::read_to_string("config/production.json")?;
    let config: Config = serde_json::from_str(&config_str)?;

    // Parsing the connection URI
    let options = ClientOptions::parse(&config.mongo_uri.trim()).await?;
    let client = Client::with_options(options)?;

    // Pinging the database to verify the connection
    client
        .database("admin")
        .run_command(mongodb::bson::doc! { "ping": 1 }, None)
        .await?;

    Ok(client)
}

pub async fn store_deployment_metadata(client: Client, request: &DeploymentRequest, project_id: &str) -> Result<(), HttpResponse> {
    match find_user_by_email(client.clone(), &request.user_email).await {
        Ok(Some(user_doc)) => {
            let user_id = user_doc.get_object_id("_id").map_err(|_| {
                HttpResponse::InternalServerError().json(ApiResponse {
                    status: "error".into(),
                    message: "Failed to extract user ID".into(),
                    returneddata: None,
                })
            })?;

            let db = client.database("deploy");
            let coll = db.collection("deployments");

            let doc = doc! {
                "project_id": project_id,
                "project_name": &request.project_name,
                "selected_service": &request.selected_service,
                "selected_server": &request.selected_server,
                "region": &request.region,
                "volume_size": request.volume_size,
                "ip_option": &request.ip_option,
                "ssh_key": &request.ssh_key,
                "terraform_template": &request.terraform_template,
                "status": "initiated",
                "timestamp": Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
                "user_id": Bson::ObjectId(user_id),
            };

            coll.insert_one(doc, None).await.map_err(|e| {
                eprintln!("❌ MongoDB insert error: {}", e);
                HttpResponse::InternalServerError().json(ApiResponse {
                    status: "error".into(),
                    message: "Failed to save metadata".into(),
                    returneddata: None,
                })
            })?;
            println!("✅ Metadata saved to MongoDB");
            println!("----------------------------------------");
            Ok(())
        }
        Ok(None) => Err(HttpResponse::BadRequest().json(ApiResponse {
            status: "error".into(),
            message: "User not found with provided email".into(),
            returneddata: None,
        })),
        Err(e) => {
            eprintln!("❌ MongoDB error: {}", e);
            Err(HttpResponse::InternalServerError().json(ApiResponse {
                status: "error".into(),
                message: "Failed to query user".into(),
                returneddata: None,
            }))
        }
    }
}


pub async fn delete_deployment(mongo_client: Client,user_id_str: &str,project_id: &str) -> Result<HttpResponse, HttpResponse> {
    
    let db = mongo_client.database("deploy");
    let coll: Collection<Document> = db.collection("deployments");

    let user_id = match ObjectId::parse_str(user_id_str) {
        Ok(oid) => oid,
        Err(_) => {
            return Err(HttpResponse::BadRequest().json(ApiResponse {
                status: "error".to_string(),
                message: "Invalid user ID format".to_string(),
                returneddata: None,
            }));
        }
    };

    let filter = doc! {
        "user_id": Bson::ObjectId(user_id),
        "project_id": project_id,
    };

    match coll.delete_one(filter, None).await {
        Ok(result) if result.deleted_count == 1 => Ok(HttpResponse::Ok().json(ApiResponse {
            status: "success".to_string(),
            message: format!("Deployment with project_id '{}' deleted successfully.", project_id),
            returneddata: None,
        })),
        Ok(_) => Err(HttpResponse::NotFound().json(ApiResponse {
            status: "error".to_string(),
            message: "No matching deployment found to delete.".to_string(),
            returneddata: None,
        })),
        Err(e) => {
            eprintln!("MongoDB delete error: {}", e);
            Err(HttpResponse::InternalServerError().json(ApiResponse {
                status: "error".to_string(),
                message: "Failed to delete deployment".to_string(),
                returneddata: None,
            }))
        }
    }
}

pub async fn update_provider_handler(mongo_client: Client,request: &ProviderRequest) -> Result<HttpResponse, HttpResponse> {
    
    match find_user_by_email(mongo_client.clone(), &request.user_email).await {
        Ok(Some(user_doc)) => {
            let user_id = match user_doc.get_object_id("_id") {
                Ok(id) => id,
                Err(_) => {
                    return Err(HttpResponse::InternalServerError().json(ApiResponse {
                        status: "error".into(),
                        message: "Failed to extract user ID".into(),
                        returneddata: None,
                    }));
                }
            };

            let filter = doc! { "_id": user_id };
            let update = doc! {
                "$set": {
                    "CloudProvider": &request.provider_key
                }
            };

            let db = mongo_client.database("deploy");
            let users = db.collection::<Document>("users");

            if let Err(err) = users.update_one(filter, update, None).await {
                eprintln!("❌ MongoDB update failed: {}", err);
                return Err(HttpResponse::InternalServerError().json(ApiResponse {
                    status: "error".into(),
                    message: "Failed to update cloud provider key".into(),
                    returneddata: None,
                }));
            }

            Ok(HttpResponse::Ok().json(ApiResponse {
                status: "success".into(),
                message: "Cloud provider token updated successfully".into(),
                returneddata: None,
            }))
        }

        Ok(None) => Err(HttpResponse::NotFound().json(ApiResponse {
            status: "error".into(),
            message: "User not found".into(),
            returneddata: None,
        })),

        Err(err) => {
            eprintln!("❌ DB error: {}", err);
            Err(HttpResponse::InternalServerError().json(ApiResponse {
                status: "error".into(),
                message: "Database error".into(),
                returneddata: None,
            }))
        }
    }
}



pub async fn fetch_cloud_provider(email: &str) -> Result<String, Box<dyn Error>> {
    let mongo_client = init_mongo_client().await;
    let user_result = find_user_by_email(mongo_client, email).await?;

    if let Some(user_doc) = user_result {
        match user_doc.get("CloudProvider") {
            Some(Bson::String(cloud_key)) => Ok(cloud_key.to_string()),
            Some(Bson::Null) | None => Err("Cloud provider not set for this user.".into()),
            _ => Err("Cloud provider field is in an unexpected format.".into()),
        }
    } else {
        Err("User not found.".into())
    }
}