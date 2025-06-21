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

prompt2 = " Detect the 2d bounding boxes of objects in image. Return just box_2d and labels, no additional text."
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
height, width = img.shape[:2]
parking_spaces = []

for idx, item in enumerate(json_object):

   # By default, gemini model return output with y coordinates first.

   # Scale normalized box coordinates (0–1000) to image dimensions
   y1, x1, y2, x2 = item["box_2d"]
   xcoord = (int(x1) + int(x2)) // 2
   ycoord = (int(y1) + int(y2)) // 2
   abs_y1 = int(y1/1000 * height)
   abs_x1 = int(x1/1000 * width)
   abs_y2 = int(y2/1000 * height)
   abs_x2 = int(x2/1000 * width)
   top_left = (abs_x1, abs_y1)
   bottom_right = (abs_x2, abs_y2)
   parking_spaces.append([abs_x1, abs_y1, abs_x2, abs_y2])
   spot_coords = (xcoord, ycoord)
   cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 2)
#    cv2.circle(img, spot_coords, radius=10, color=(0, 255, 0), thickness=-1)

new_img = "box-lot4.jpg"   
cv2.imwrite(new_img, img)

# results = {"occupied": [], "empty": []}
# img2 = cv2.imread(new_img)
# for i, (x1, y1, x2, y2) in enumerate(parking_spaces):
#     # Crop the space
#     cropped = img2[y1:y2, x1:x2]
#     temp_path = f"space_{i}.jpg"
#     cv2.imwrite(temp_path, cropped)
    
#     # Analyze with Gemini
#     my_file = client.files.upload(file=temp_path)
#     response = client.models.generate_content(
#         model="gemini-2.5-flash",
#         contents=[my_file, "Is there a vehicle in this image? Answer 'yes' or 'no'."]
#     )
    
#     # Classify space
#     if response.text.lower() == "yes":
#         results["occupied"].append(i + 1)
#     else:
#         results["empty"].append(i + 1)


