from google import genai
import json
import re
import cv2
from pydantic import BaseModel

client = genai.Client(api_key="AIzaSyDAVXbT9QeZp4g3kxzVunP7Xo6koqJZk5Q")
spare_key = 'AIzaSyAsooTvjTuhVcBG6x_7BIAl0ix9w0NTdVU'
image_path = "images/boxes/4.png"
my_file = client.files.upload(file=image_path)
img = cv2.imread(image_path)

class Parking(BaseModel):
    box_2d: list[int]
    label: str

def clean_results(results):
    # Example cleaning logic to ensure results is a valid JSON string
    return results.strip()

prompt2 = " Detect the 2d bounding boxes of objects in image. Return just box_2d and labels, no additional text. box_2d coordinates should be like so: [y1, x1, y2, x2], labels should always either be 'car' or 'empty"
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[my_file, prompt2],
    config={
        "response_mime_type": "application/json",
        "response_schema": list[Parking],
    }
)
json_object = json.loads(response.text)


i = 5
h, w = img.shape[:2]
parking_spaces = []

h, w = img.shape[:2]


for idx, item in enumerate(json_object):
    y1, x1, y2, x2 = item["box_2d"]
    y1 = int(y1 / 1000 * h)
    x1 = int(x1 / 1000 * w)
    y2 = int(y2 / 1000 * h)
    x2 = int(x2 / 1000 * w)
    if x1 > x2:
        x1, x2 = x2, x1  # Swap x-coordinates if needed
    if y1 > y2:
        y1, y2 = y2, y1 
    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
    center_x = (x1 + x2) // 2
    center_y = (y1 + y2) // 2
    if item["label"] == "empty":
        cv2.circle(img, (center_x, center_y), radius=5, color=(0, 0, 255), thickness=-1)


new_img = "another1.jpg"   
cv2.imwrite(new_img, img)


