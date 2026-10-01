import cv2

print("🔍 Scanning for cameras...")
for i in range(5):  # Check indices 0 through 4
    cap = cv2.VideoCapture(i, cv2.CAP_DSHOW)
    if cap.isOpened():
        print(f"✅ SUCCESS: Camera found at index {i}!")
        cap.release()
    else:
        print(f"❌ Failed at index {i}")