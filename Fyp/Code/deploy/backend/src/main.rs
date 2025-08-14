use actix_web::{web, App, HttpServer, HttpResponse};
use actix_cors::Cors;
use dotenvy::dotenv;
use mongodb::Client;
use std::env;

mod api;
mod utils;

use utils::settings::cloudprovider::update_provider;
use utils::deployment::deploy;
use utils::database::db;
use utils::settings::app_config;
use utils::database::db::{create_indexes};
use utils::deployment::deploy::{deploy, undeploy};
use utils::deployment::deployments::fetch_deployment_by_user_email;
use utils::user::signup_func::{handle_signup, init_mongo_client};
use utils::user::login_func::handle_login;
use utils::s3_bucket_handler::s3_handler;
use utils::terraform::terraform_handler;
use utils::user::check_auth;
use app_config::AppConfig;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // ✅ Load environment variables
    dotenv().ok();
    println!("--------------------------------------------\n");

    if let Ok(bucket) = env::var("S3_BUCKET") {
        println!("📦 Using bucket: {}", bucket);
        println!("--------------------------------------------");
    }

    if let Ok(region) = env::var("AWS_REGION") {
        println!("🌍 Using region: {}", region);
    }

    println!("----------------------------------------");
    println!("🔗 Connecting to MongoDB...");
    println!("----------------------------------------");

    let mongo_client = init_mongo_client().await;
    create_indexes(&mongo_client).await;

    let app_config = match app_config::load_config("config/production.json") {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("❌ Failed to load config: {}", e);
            std::process::exit(1);
        }
    };

    println!("🚀 Starting API server on http://localhost:8080");
    println!("----------------------------------------");

    create_http_server(mongo_client, app_config).await
}

pub async fn create_http_server(mongo_client: Client, app_config: AppConfig) -> std::io::Result<()> {
    let app_config_data = web::Data::new(app_config);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION,
                actix_web::http::header::ACCEPT,
                actix_web::http::header::CONTENT_TYPE,
            ])
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(mongo_client.clone()))
            .app_data(app_config_data.clone())
            .service(web::resource("/signup").route(web::post().to(handle_signup)))
            .service(web::resource("/login").route(web::post().to(handle_login)))
            .service(web::resource("/deployments").route(web::get().to(fetch_deployment_by_user_email)))
            .service(web::resource("/deploy").route(web::post().to(deploy)))
            .service(web::resource("/undeploy").route(web::post().to(undeploy)))
            .service(web::resource("/settings").route(web::post().to(update_provider)))
            .service(web::resource("/check-auth").route(web::get().to(check_auth::check_auth)))
            .service(web::resource("/").route(web::get().to(|| async {
                HttpResponse::Ok().body("API is running")
            })))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
