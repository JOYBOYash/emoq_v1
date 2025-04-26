here is step by step process to test the backend python code for emotional based story:

step 1 :create a new folder in vs code for the project

step 2: open terminal in vs code

step 3 : enter this command:
  git clone https://github.com/JeromeJaya/groq-hackathon

step 4 : next install all the requiered lib using this command
  pip install -r requirements.txt

step 5 : now run the following command to run the server
  uvicorn main:app --reload

step 6 : open the displayed local host port from the terminal

step 7 : In the url add "/docs" at the end to open the fastapi api swager UI
 example: http://127.0.0.1:8000/docs

step 8 : click on "try it now" then click "execute"
![fd](https://github.com/user-attachments/assets/8049064c-4831-4a43-a147-adf1e179dd3c)

step 9 :you can see the responce.

![res groq](https://github.com/user-attachments/assets/4b4e08fa-0b9d-47f9-a442-13a45a17a15b)

step 10: you can also see the generated story in "story.txt" file
  ![gro](https://github.com/user-attachments/assets/7cdce34b-3d39-4ecd-980d-c3fcea51af39)

step 11: you can change the index value (0 to 6) from the main.py file in line 10 for testing with different emotions.

step 12: you can repeate the step 7, to see continue of the story for different emotions.
