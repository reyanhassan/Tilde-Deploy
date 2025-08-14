use serde::Deserialize;
use std::fs;
use std::env;
use serde_json;

#[derive(Clone, Debug, Deserialize)]
pub struct AppConfig {
    pub mongo_uri: String,
    pub s3_bucket: String,
    pub aws_region: String,
}


pub fn load_config(path: &str) -> Result<AppConfig, Box<dyn std::error::Error>> {
    
    dotenvy::dotenv().ok();

    let config_contents = fs::read_to_string(path)?;
    let mut config: AppConfig = serde_json::from_str(&config_contents)?;

    // Override only if the field value is literally "env"
    if config.mongo_uri == "env" {
        config.mongo_uri = env::var("MONGO_URI")
            .expect("MONGO_URI environment variable must be set when mongo_uri is 'env'");
    }

    if config.aws_region == "env" {
        config.aws_region = env::var("AWS_REGION")
            .expect("AWS_REGION environment variable must be set when aws_region is 'env'");
    }

    if config.s3_bucket == "env" {
        config.s3_bucket = env::var("S3_BUCKET")
            .expect("S3_BUCKET environment variable must be set when s3_bucket is 'env'");
    }

    Ok(config)
}
