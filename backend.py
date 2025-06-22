from google import genai
import json
import re
import cv2
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import random

class ComputerVision():
    def __init__(self):
        load_dotenv()
        self.folder_path = "images/boxes/"
        files = [f for f in os.listdir(self.folder_path) if os.path.isfile(os.path.join(self.folder_path, f))]
        self.apikey = os.getenv("API_KEY")
        self.client = genai.Client(api_key=self.apikey)
        self.image_path = f"images/boxes/{random.choice(files)}"
        # self.image_path = f"images/boxes/6.png"
        self.my_file = self.client.files.upload(file=self.image_path)
        self.img = cv2.imread(self.image_path)
        self.prompt = "The green outlines represent vehicles and parking bays, where the red dots help distinguish the open parking bays. In one or 2 sentences exactly identify the ideal parking spot using surrounding descriptors."
        self.prompt2 = " Detect the 2d bounding boxes of objects in image. Return just box_2d and labels, no additional text. box_2d coordinates should be like so: [y1, x1, y2, x2], labels should always either be 'car' or 'empty"
        

    def make_bounding_box(self):

        class Parking(BaseModel):
            box_2d: list[int]
            label: str

        def clean_results(results):
            # Example cleaning logic to ensure results is a valid JSON string
            return results.strip()

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[self.my_file, self.prompt2],
            config={
                "response_mime_type": "application/json",
                "response_schema": list[Parking],
            }
        )
        json_object = json.loads(response.text)


        i = 5
        h, w = self.img.shape[:2]
        parking_spaces = []

        h, w = self.img.shape[:2]


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
            cv2.rectangle(self.img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            if item["label"] == "empty":
                cv2.circle(self.img, (center_x, center_y), radius=8, color=(0, 0, 255), thickness=-1)


        new_img = "another13.jpg"   
        cv2.imwrite(new_img, self.img)

        return new_img
    
    def optimal_spot(self, image):
        open_file = f"images/boxes/{image}"
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[open_file, self.prompt],
 
        )
        return response.text

if __name__ == "__main__":
    c = ComputerVision()
    # image = c.make_bounding_box()
    image = "another12.jpg"
    print(c.optimal_spot(image))
