from PIL import Image
import os

# =============================
#  CONFIG
# =============================

SRC = "static"              # Ảnh gốc
DEST_THUMB = "static/thumb" # Thumbnails JPG

THUMB_WIDTH = 300           # Chiều rộng thumbnail
QUALITY_JPG = 85            # Chất lượng JPG

# =============================
#  SETUP FOLDER
# =============================

os.makedirs(DEST_THUMB, exist_ok=True)

# =============================
#  PROCESS
# =============================

def create_thumbnail(img, save_path):
    w_percent = THUMB_WIDTH / img.size[0]
    h_size = int(img.size[1] * w_percent)
    img_resized = img.resize((THUMB_WIDTH, h_size), Image.LANCZOS)
    img_resized.save(save_path, "JPEG", quality=QUALITY_JPG)

for filename in os.listdir(SRC):
    if not filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
        continue

    src_path = os.path.join(SRC, filename)

    base = os.path.splitext(filename)[0]

    thumb_path = os.path.join(DEST_THUMB, base + ".webp")

    # Bỏ qua nếu đã tạo trước đó (tăng tốc mạnh)
    if os.path.exists(thumb_path):
        print(f"Bỏ qua (đã có): {filename}")
        continue

    try:
        img = Image.open(src_path)

        # Với GIF → lấy frame đầu
        if getattr(img, "is_animated", False):
            img = img.convert("RGB")
        else:
            img = img.convert("RGB")

        print(f"Đang xử lý: {filename}")

        # ---- Tạo thumbnail ----
        if not os.path.exists(thumb_path):
            create_thumbnail(img, thumb_path)

    except Exception as e:
        print(f"Lỗi với {filename}: {e}")

print("\n🎉 Hoàn thành! Thumbnail đã tạo xong.")
