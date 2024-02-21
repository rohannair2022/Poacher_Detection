import streamlit as st
from detector import return_val


with st.container():
    st.title("Video Uploader")

    uploaded_file = st.file_uploader("Choose a video file", type=["mp4", "avi", "mov"])

    if uploaded_file is not None:
        # You can process the uploaded file or display it
        st.video(uploaded_file)
