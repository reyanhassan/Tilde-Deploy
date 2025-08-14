use actix_web::{
    web, HttpResponse, Responder,
    cookie::{Cookie, SameSite}
};
use mongodb::{Client, bson::{doc, Bson}};
use bcrypt::{hash, DEFAULT_COST};
use serde::Deserialize;
use uuid::Uuid;
use chrono::Utc;

use crate::db::{add_user_data, connect_to_mongo};
use crate::deploy::ApiResponse;
use crate::utils::database::db::create_session;
use crate::utils::user::login_func::login_user_by_credentials;

#[derive(Deserialize)]
pub struct SignupRequest {
    pub username: String,
    pub email: String,
    pub password: String,
}

pub async fn handle_signup(data: web::Json<SignupRequest>) -> impl Responder {
    let mongo_client = init_mongo_client().await;
    let signup_data = data.into_inner();

    // 1. Validate input fields
    if signup_data.username.trim().is_empty()|| signup_data.email.trim().is_empty()|| signup_data.password.trim().is_empty()
    {
        return HttpResponse::BadRequest().json(ApiResponse {
            status: "error".to_string(),
            message: "Username, email, and password must not be empty".to_string(),
            returneddata: None,
        });
    }

    // 2. Hash the password
    let hashed_password = hash(&signup_data.password, DEFAULT_COST);
    // 3. Prepare user document
    let new_user = doc! {
        "username": signup_data.username.to_string(),
        "email": signup_data.email.to_string(),
        "password": hashed_password.unwrap_or_else(|_| "Error hashing password".to_string()),
        "createdAt": Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        "updatedAt": Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        "CloudProvider": Bson::Null,
    };

    // 4. Store user
    match add_user_data(mongo_client.clone(), new_user).await {
        Ok(_user_id) => {
            // 5. Auto-login after signup
            match login_user_by_credentials(mongo_client.clone(),&signup_data.email, &signup_data.password).await {
                Ok(response_data) => {
                    let session_token = Uuid::new_v4().to_string();

                    // Create session in DB
                    if let Err(e) = create_session(&session_token, &signup_data.email, &mongo_client).await {
                        return HttpResponse::InternalServerError().json(ApiResponse {
                            status: "error".to_string(),
                            message: format!("Failed to create session: {}", e),
                            returneddata: None,
                        });
                    }

                    // Build session cookie
                    let session_cookie = Cookie::build("session_id", session_token.clone())
                        .path("/")
                        .domain("localhost") // change this in prod
                        .http_only(true)
                        .same_site(SameSite::None)
                        .secure(true) // set to true if using HTTPS
                        .finish();

                    return HttpResponse::Ok()
                        .cookie(session_cookie)
                        .append_header(("X-Session-Token", session_token))
                        .json(ApiResponse {
                            status: "success".to_string(),
                            message: "Signup and login successful".to_string(),
                            returneddata: Some(response_data),
                        });
                }
                Err(err_response) => {
                    return HttpResponse::Unauthorized().json(err_response);
                }
            }
        }
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse {
            status: "error".to_string(),
            message: format!("Error creating user: {}", e),
            returneddata: None,
        }),
    }
}

pub async fn init_mongo_client() -> Client {
    match connect_to_mongo().await {
        Ok(client) => {
            println!("✅ Connected to MongoDB!");
            println!("----------------------------------------");
            client
        }
        Err(e) => {
            eprintln!("❌ Failed to connect to MongoDB: {}", e);
            println!("----------------------------------------");
            std::process::exit(1);
        }
    }
}
