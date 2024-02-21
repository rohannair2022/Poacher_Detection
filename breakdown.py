import cv2
import os
from datetime import datetime


def return2():
    # Open a video capture object
    cap = cv2.VideoCapture("video/video.mp4")

    # Create a directory to save the frames
    save_directory = 'saved_frames'
    os.makedirs(save_directory, exist_ok=True)

    # Initialize a variable to keep track of time
    start_time = datetime.now()

    while True:
        # Read a frame
        ret, frame = cap.read()

        # Check if the frame was successfully read
        if not ret:
            break

        # Get the current time
        current_time = datetime.now()

        # Check if 5 seconds have passed since the last frame
        if (current_time - start_time).seconds >= 5:
            # Save the frame with a filename based on the timestamp
            filename = os.path.join(save_directory, f"frame_{current_time.strftime('%Y%m%d%H%M%S')}.jpg")
            cv2.imwrite(filename, frame)

            # Update the start time for the next frame
            start_time = current_time

        # Display the frame (optional)
        cv2.imshow('Frame', frame)

        # Break the loop if 'q' key is pressed
        if cv2.waitKey(25) & 0xFF == ord('q'):
            break

    # Release the video capture object
    cap.release()

    # Close all OpenCV windows
    cv2.destroyAllWindows()
