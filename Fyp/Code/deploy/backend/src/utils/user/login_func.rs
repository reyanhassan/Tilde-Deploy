use actix_web::{
    web, HttpResponse, Responder,
    cookie::{Cookie, SameSite, time::Duration}
};
use mongodb::{bson::doc, Client};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::utils::user::signup_func::init_mongo_client;
use crate::utils::database::db::{create_session, get_deployments_by_user_id, verify_user};
use crate::deploy::ApiResponse;

#[derive(Deserialize, Serialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}

pub async fn handle_login(data: web::Json<LoginRequest>) -> impl Responder {
    
    let mongo_client = init_mongo_client().await;
    let user_login = data.into_inner();

    match login_user_by_credentials(mongo_client.clone(), &user_login.email, &user_login.password).await {
        Ok(response_data) => {
            let session_token = Uuid::new_v4().to_string();

            // You'll need this to create session

            if let Err(e) = create_session(&session_token, &user_login.email, &mongo_client).await {
                return HttpResponse::InternalServerError().json(ApiResponse {
                    status: "error".to_string(),
                    message: format!("Failed to create session: {}", e),
                    returneddata: None,
                });
            }

            let session_cookie = Cookie::build("session_id", &session_token)
                .path("/")
                .http_only(true)
                .same_site(SameSite::Lax)
                .secure(false)
                .max_age(Duration::days(30))
                .finish();

            HttpResponse::Ok()
                .cookie(session_cookie)
                .append_header(("X-Session-Token", session_token))
                .json(ApiResponse {
                    status: "success".to_string(),
                    message: "Login successful".to_string(),
                    returneddata: Some(response_data),
                })
        }
        Err(err_response) => HttpResponse::Unauthorized().json(err_response),
    }
}

pub async fn login_user_by_credentials(mongo_client:Client, email: &str,password: &str) -> Result<serde_json::Value, ApiResponse> {


    if email.trim().is_empty() || password.trim().is_empty() {
        return Err(ApiResponse {
            status: "error".to_string(),
            message: "Email and password must not be empty".to_string(),
            returneddata: None,
        });
    }

    match verify_user(mongo_client.clone(), email, password).await {
        Ok(Some(user_doc)) => {
            let mut clean_user = user_doc.clone();
            clean_user.remove("password");

            let user_id = match user_doc.get_object_id("_id") {
                Ok(id) => id,
                Err(_) => {
                    return Err(ApiResponse {
                        status: "error".to_string(),
                        message: "User ID is missing or invalid".to_string(),
                        returneddata: None,
                    });
                }
            };

            match get_deployments_by_user_id(mongo_client, &user_id).await {
                Ok(deployments) => {
                    let welcome_message = format!(
                        "Login successful, welcome {}",
                        clean_user.get_str("email").unwrap_or("user")
                    );

                    let response_body = if deployments.is_empty() {
                        serde_json::json!({
                            "status": "success",
                            "message": welcome_message,
                            "user": clean_user,
                            "deployments": [],
                            "deployment_message": "No deployments found"
                        })
                    } else {
                        serde_json::json!({
                            "status": "success",
                            "message": welcome_message,
                            "user": clean_user,
                            "deployments": deployments
                        })
                    };

                    Ok(response_body)
                }
                Err(e) => Err(ApiResponse {
                    status: "error".to_string(),
                    message: format!("Failed to fetch deployments: {}", e),
                    returneddata: None,
                }),
            }
        }
        Ok(None) => Err(ApiResponse {
            status: "fail".to_string(),
            message: "Invalid email or password".to_string(),
            returneddata: None,
        }),
        Err(e) => Err(ApiResponse {
            status: "error".to_string(),
            message: format!("Error verifying user credentials: {}", e),
            returneddata: None,
        }),
    }
}

