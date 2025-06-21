from google import genai
import json
import re
import cv2

client = genai.Client(api_key="AIzaSyDAVXbT9QeZp4g3kxzVunP7Xo6koqJZk5Q")
spare_key = 'AIzaSyAsooTvjTuhVcBG6x_7BIAl0ix9w0NTdVU'
image_path = "images/boxes/0.png"
my_file = client.files.upload(file=image_path)
img = cv2.imread(image_path)


def clean_results(results):
    # Example cleaning logic to ensure results is a valid JSON string
    return results.strip()

prompt2 = " Detect the 2d bounding boxes of objects in image. Return just box_2d and labels, no additional text."
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[my_file, prompt2],
)
x = response.text
y = type(x)


json_str = x.replace("```json\n", "").replace("\n```", "").strip()
json_object = json.loads(json_str)
# print('-------------------------------------')
# car_match = re.search(r"car:\s*\((\d+),\s*(\d+)\)", response.text)
# spot_match = re.search(r"parking spot:\s*\((\d+),\s*(\d+)\)", response.text)
# 
# if car_match:
#     car_coords = (int(car_match.group(1)), int(car_match.group(2)))
#     print("Car:", car_coords)
# 
# if spot_match:
#     spot_coords = (int(spot_match.group(1)), int(spot_match.group(2)))
#     print("Parking Spot:", spot_coords)

# cv2.circle(img, spot_coords, radius=10, color=(0, 255, 0), thickness=-1)
# cv2.circle(img, car_coords, radius=10, color=(255, 0, 0), thickness=-1)
# 
# 
# cv2.imwrite("annotated_lot2.jpg", img)

# cln_results = json.loads(clean_results(response.txt))
i = 5
height, width = img.shape[:2]

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
   spot_coords = (xcoord, ycoord)
   cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 2)
#    cv2.circle(img, spot_coords, radius=10, color=(0, 255, 0), thickness=-1)

   
cv2.imwrite("annotated_lot12.jpg", img)


