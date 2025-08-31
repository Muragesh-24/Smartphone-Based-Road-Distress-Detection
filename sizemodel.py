# main.py: Run YOLOv8 inference and post-process with DeepCrackModel
import argparse
import cv2
import torch
import numpy as np
import os
from inference_utils import inference, create_model
from ultralytics import YOLO

# main.py: Accept a crack image, run DeepCrack inference, and print crack height and width
import argparse
import cv2
import torch
from inference_utils import inference, create_model

def main():
	parser = argparse.ArgumentParser(description='Run DeepCrack inference on a crack image and print crack height and width.')
	parser.add_argument('image', type=str, help='Path to crack image')
	parser.add_argument('--unit', type=str, default='px', help='Unit for output measurements')
	parser.add_argument('--weights', type=str, default='yolov8_descon.pt', help='Path to DeepCrack weights')
	args = parser.parse_args()

	# Read image and get dimensions
	img = cv2.imread(args.image)
	if img is None:
		print(f"Error: Could not read image {args.image}")
		return
	dim = (img.shape[1], img.shape[0])
	with open(args.image, 'rb') as f:
		bytesImg = f.read()

	# Load DeepCrack model
	opt = type('opt', (), {})()
	opt.device = 'cuda' if torch.cuda.is_available() else 'cpu'
	opt.model = 'deepcrack'
	model = create_model(opt, cp_path=args.weights)

	# Run DeepCrack inference and get crack length and width
	length, width = inference(model, bytesImg, dim, args.unit)
	if length is None or width is None:
		print("No crack detected.")
		return
	print(f"Crack length: {length:.2f} {args.unit}")
	print(f"Crack width: {width:.2f} {args.unit}")

if __name__ == '__main__':
	main()
