## backend.py - Kevin's stuff
- make sure this is in the same directory as the images folder
- Import the class ComputerVision()
- It contains 2 functions: make_bounding_box, optimal_spot
- make_bounding_box has no input parameters, creates bounding boxes on the images and returns the image name
- optimal_spot takes in a parameter for the image name, and returns a string containing info on the best parking spot

Sample usage:
```python
c = ComputerVision()
image = c.make_bounding_box()
print(c.optimal_spot(image))
```
