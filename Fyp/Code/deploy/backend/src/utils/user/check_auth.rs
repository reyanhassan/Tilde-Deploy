use actix_web::{HttpRequest, HttpResponse, web};
use serde_json::json;
use mongodb::Client;
use mongodb::bson::doc; 
use mongodb::bson::Document;

/// Simulate session lookup — replace this with real logic
use crate::utils::database::db::{validate_session};


/// Simulate getting user data from MongoDB
async fn get_user_by_email(
    email: &str, 
    client: &Client
) -> Result<Option<Document>, mongodb::error::Error> {
    let db = client.database("deploy");
    let collection = db.collection("users");
    collection.find_one(doc! { "email": email }, None).await
}

pub async fn check_auth(
    req: HttpRequest,
    mongo: web::Data<Client>,
) -> HttpResponse {
    // Try both authentication methods
    let token = req.cookie("session_id")
        .map(|c| c.value().to_string())
        .or_else(|| {
            req.headers()
                .get("X-Session-Token")
                .and_then(|h| h.to_str().ok().map(String::from))
        });

    println!("🔐 Check-Auth Called");
    println!("   Token: {:?}", token);
    
    match token {
        Some(session_token) => {
            println!("   Validating session: {}", session_token);
            match validate_session(&session_token, &mongo).await {
                Some(email) => {
                    println!("   Session valid for: {}", email);
                    match get_user_by_email(&email, &mongo).await {
                        Ok(Some(mut user_doc)) => {
                            user_doc.remove("password");
                            HttpResponse::Ok().json(json!({
                                "user": user_doc,
                                "token": session_token
                            }))
                        },
                        _ => {
                            println!("   User not found for email: {}", email);
                            unauthorized_response()
                        }
                    }
                },
                None => {
                    println!("   Invalid session token");
                    unauthorized_response()
                }
            }
        },
        None => {
            println!("   No token provided");
            unauthorized_response()
        }
    }
}
// Helper function for consistent error responses
fn unauthorized_response() -> HttpResponse {
    HttpResponse::Unauthorized().json(json!({
        "message": "Not authenticated",
        "code": "UNAUTHORIZED"
    }))
}
