import os
import base64
import json
import urllib.request
import urllib.error

# Cấu hình
TOKEN_FILE = "accesstoken.txt"
API_URL = "http://localhost:3001/products"

def decode_jwt(token):
    """Giải mã phần Payload của JWT"""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        payload = parts[1]
        payload += '=' * (-len(payload) % 4)
        decoded = base64.b64decode(payload).decode('utf-8')
        return json.loads(decoded)
    except Exception:
        return None

def main():
    # 1. Tìm và đọc file token.txt
    script_dir = os.path.dirname(os.path.realpath(__file__))
    token_path = os.path.join(script_dir, TOKEN_FILE)

    if not os.path.exists(token_path):
        print(f"[-] LỖI: Không tìm thấy file {TOKEN_FILE} tại {script_dir}")
        return

    with open(token_path, 'r') as f:
        # Đọc các dòng, bỏ qua dòng trống và dòng chú thích (#)
        lines = [l.strip() for l in f.readlines() if l.strip() and not l.startswith('#')]
        if not lines:
            print(f"[-] LỖI: File {TOKEN_FILE} đang trống hoặc không có token hợp lệ.")
            return
        token = lines[0]

    print("=" * 50)
    print(f"[*] ĐANG KIỂM TRA TOKEN TỪ FILE: {TOKEN_FILE}")
    print("=" * 50)

    # 2. Giải mã để xem "Tôi là ai?"
    payload = decode_jwt(token)
    if payload:
        print(f"[+] Danh tính: {json.dumps(payload, indent=2)}")
    else:
        print("[-] Cảnh báo: Token không đúng định dạng JWT.")

    # 3. Gửi request thực tế đến Backend
    print(f"\n[*] Request đến: {API_URL}...")
    req = urllib.request.Request(API_URL)
    req.add_header('Authorization', f'Bearer {token}')

    try:
        with urllib.request.urlopen(req) as response:
            print(f"[+] Kết quả: {response.getcode()} OK")
            print("[+] TRẠNG THÁI: TRUY CẬP THÀNH CÔNG!")
    except urllib.error.HTTPError as e:
        print(f"[-] Kết quả: {e.code} {e.reason}")
        print("[-] TRẠNG THÁI: TRUY CẬP THẤT BẠI (Unauthorized).")
    except Exception as e:
        print(f"[-] Lỗi kết nối: {str(e)}")
        print("[!] Hãy chắc chắn Backend (port 3001) đang chạy.")

    print("=" * 50)

if __name__ == "__main__":
    main()
