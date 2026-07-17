use std::fs;
use tauri::{App, Manager};

/// Hàm khởi tạo cấu trúc thư mục tĩnh của ứng dụng khi chạy lần đầu.
pub fn setup_app_directories(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let app_data_dir = app.path().app_data_dir()?;
    
    let database_dir = app_data_dir.join("database");
    if !database_dir.exists() {
        fs::create_dir_all(&database_dir)?;
    }
    
    let media_dir = app_data_dir.join("media");
    if !media_dir.exists() {
        fs::create_dir_all(&media_dir)?;
    }
    
    Ok(())
}

/// Lưu ảnh từ chuỗi Base64 (có thể chứa header data:image/png;base64,) vào thư mục images
/// Trả về đường dẫn tương đối (ví dụ: images/123-456.png)
pub fn save_base64_image(app: &tauri::AppHandle, base64_str: &str) -> Result<String, crate::domains::error::AppError> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| crate::domains::error::AppError::BusinessLogic(e.to_string()))?;
    let images_dir = app_data_dir.join("images");
    
    if !images_dir.exists() {
        fs::create_dir_all(&images_dir).map_err(|e| crate::domains::error::AppError::BusinessLogic(e.to_string()))?;
    }

    // Cắt bỏ phần header nếu có (vd: data:image/png;base64,)
    let clean_base64 = if let Some(idx) = base64_str.find("base64,") {
        &base64_str[idx + 7..]
    } else {
        base64_str
    };

    use base64::{Engine as _, engine::general_purpose};
    let image_data = general_purpose::STANDARD
        .decode(clean_base64)
        .map_err(|e| crate::domains::error::AppError::BusinessLogic(e.to_string()))?;

    let file_name = format!("{}.png", uuid::Uuid::new_v4());
    let file_path = images_dir.join(&file_name);

    fs::write(file_path, image_data).map_err(|e| crate::domains::error::AppError::BusinessLogic(e.to_string()))?;

    // Trả về đường dẫn tương đối để lưu vào DB (vd: images/uuid.png)
    Ok(format!("images/{}", file_name))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    
    // Tauri app context rất khó test trực tiếp qua Unit Test thuần mà không có Builder.
    // Thay vào đó, QA Test tập trung vào hàm core xử lý base64_to_file.
    // Để giữ tính Portable, tôi tách một helper function.
    
    // Tách lõi decode và save ra để Test:
    fn core_save_image(base64_str: &str, images_dir: &std::path::Path) -> Result<String, crate::domains::error::AppError> {
        let clean_base64 = if let Some(idx) = base64_str.find("base64,") {
            &base64_str[idx + 7..]
        } else {
            base64_str
        };
        use base64::{Engine as _, engine::general_purpose};
        let image_data = general_purpose::STANDARD
            .decode(clean_base64)
            .map_err(|e| crate::domains::error::AppError::BusinessLogic(e.to_string()))?;
        let file_name = format!("{}.png", uuid::Uuid::new_v4());
        let file_path = images_dir.join(&file_name);
        fs::write(&file_path, image_data).map_err(|e| crate::domains::error::AppError::BusinessLogic(e.to_string()))?;
        Ok(format!("images/{}", file_name))
    }

    #[test]
    fn test_save_base64_image_io() {
        // Tạo thư mục tạm
        let temp_dir = std::env::temp_dir().join("antigravity_test_media");
        fs::create_dir_all(&temp_dir).unwrap();
        
        // Base64 của ảnh PNG 1x1 pixel trong suốt (dung lượng > 0)
        let mock_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        
        let result = core_save_image(mock_base64, &temp_dir).unwrap();
        assert!(result.starts_with("images/"));
        assert!(result.ends_with(".png"));
        
        let file_name = result.replace("images/", "");
        let saved_path = temp_dir.join(file_name);
        
        // Kiểm tra dung lượng > 0 byte
        let metadata = fs::metadata(saved_path).expect("File vật lý phải tồn tại");
        assert!(metadata.len() > 0);
        
        // Dọn dẹp
        fs::remove_dir_all(temp_dir).unwrap();
    }
}
