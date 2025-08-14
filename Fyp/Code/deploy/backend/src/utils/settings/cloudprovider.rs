use serde::{Deserialize, Serialize};
use actix_web::{web, Responder};

use crate::{
    db::update_provider_handler, 
    utils::user::signup_func::init_mongo_client,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderRequest {
    pub user_email: String,
    pub provider_key: String,
}

pub async fn update_provider(request: web::Json<ProviderRequest>) -> impl Responder {
    
    let mongo_client=init_mongo_client().await;
    let request = request.into_inner();

    match update_provider_handler(mongo_client.clone(), &request).await {
        Ok(success_resp) => success_resp,
        Err(error_resp) => error_resp,
    }
}

