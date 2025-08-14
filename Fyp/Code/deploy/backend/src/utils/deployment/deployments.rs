use actix_web::{web, HttpResponse, Responder};
use serde_json::json;
use serde::Deserialize;
use crate::db::{find_user_by_email, get_deployments_by_user_id};
use crate::deploy::ApiResponse;
use crate::utils::user::signup_func::init_mongo_client;

#[derive(Deserialize)]
pub struct FetchDeploymentRequest {
    pub email: String,
}

pub async fn fetch_deployment_by_user_email(data: web::Json<FetchDeploymentRequest>) -> impl Responder {
    let mongo_client = init_mongo_client().await;
    let email = &data.email;

    match find_user_by_email(mongo_client.clone(), email).await {
        Ok(Some(mut user)) => {
            user.remove("password");

            match user.get_object_id("_id") {
                Ok(user_id) => {
                    match get_deployments_by_user_id(mongo_client, &user_id).await {
                        Ok(deployments) => {
                            let message = if deployments.is_empty() {
                                "No deployments found".to_string()
                            } else {
                                "Deployment data fetched successfully".to_string()
                            };

                            HttpResponse::Ok().json(ApiResponse {
                                status: "success".to_string(),
                                message,
                                returneddata: Some(json!({
                                    "user": user,
                                    "deployments": deployments
                                })),
                            })
                        }
                        Err(e) => HttpResponse::InternalServerError().json(ApiResponse {
                            status: "error".to_string(),
                            message: format!("Error fetching deployments: {}", e),
                            returneddata: None,
                        }),
                    }
                }
                Err(_) => HttpResponse::InternalServerError().json(ApiResponse {
                    status: "error".to_string(),
                    message: "Invalid user ID format".to_string(),
                    returneddata: None,
                }),
            }
        }
        Ok(None) => HttpResponse::NotFound().json(ApiResponse {
            status: "fail".to_string(),
            message: "User not found".to_string(),
            returneddata: None,
        }),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse {
            status: "error".to_string(),
            message: format!("Error finding user: {}", e),
            returneddata: None,
        }),
    }
}