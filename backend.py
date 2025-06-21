from google import genai
import json
import re
import cv2
client = genai.Client(api_key="AIzaSyDAVXbT9QeZp4g3kxzVunP7Xo6koqJZk5Q")

my_file = client.files.upload(file="images/boxes/0.png")
img = cv2.imread("images/boxes/0.png")
prompt = """

"Analyze the provided aerial image of a parking lot with a central driving lane and perform the following tasks:

    Identify an open space in the driving lane where a car could potentially fit. The driving lane is the central asphalt strip running through the parking lot. The open space should be large enough for a car and not occupied by another vehicle or any obstacle. Determine the coordinates of the center of this open space.
    Identify any open parking spaces that are not occupied by a vehicle. Parking spaces are designated spots marked with white lines and may be outlined with colored bounding boxes. Parking spaces outlined in red are taken, parking spaces outlined in blue are vacant and can be used. If there are multiple open parking spaces, select the first one from the top of the image. Determine the coordinates of the center of this open parking space.

Provide the results in the following format, with each item on a separate line:
    car: (x, y)
parking spot: (x, y)

Where (x, y) are the pixel coordinates of the center of the respective space, with (0,0) being the top-left corner of the image.

If no open space is found in the driving lane, use 'car: none'. If no parking spaces are available, use 'parking spot: none'."

"""
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
for idx, item in enumerate(json_object):

   # By default, gemini model return output with y coordinates first.

   # Scale normalized box coordinates (0–1000) to image dimensions
   y1, x1, y2, x2 = item["box_2d"]
   xcoord = (int(x1) + int(x2)) // 2
   ycoord = (int(y1) + int(y2)) // 2
   top_left = (x1, y1)
   bottom_right = (x2, y2)
   spot_coords = (xcoord, ycoord)
   cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 2)
#    cv2.circle(img, spot_coords, radius=10, color=(0, 255, 0), thickness=-1)

   
cv2.imwrite("annotated_lot10.jpg", img)


