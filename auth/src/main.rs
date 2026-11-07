use don_core::{DonServer, axum::Router};
use don_core::upload::get_upload_routes;

#[tokio::main]
async fn main() {
    // Load environment variables (DATABASE_URL is required to start the server)
    dotenvy::dotenv().ok();
    println!("Starting Don Framework with File Uploads...");

    // 1. Define your API routes
    let api_routes = Router::new()
        // ✨ THE MAGIC: 1-Line File Upload API!
        .nest("/api/upload", get_upload_routes());

    // 2. Start the Server
    // The framework will automatically serve the uploaded files at http://localhost:8080/uploads/...
    DonServer::new()
        .port(8080)
        .with_routes(api_routes)
        .start()
        .await
        .expect("Server crashed!");
}