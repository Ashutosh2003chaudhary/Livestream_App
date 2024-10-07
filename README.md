# Livestream Overlay Manager

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setting Up the Application](#setting-up-the-application)
    - [Clone the Repository](#clone-the-repository)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
4. [Using the Application](#using-the-application)
    - [Inputting the RTSP URL](#inputting-the-rtsp-url)
        - [Step-by-Step Instructions](#step-by-step-instructions)
        - [Sample RTSP URLs](#sample-rtsp-urls)
    - [Managing Overlays](#managing-overlays)
        - [Adding an Overlay](#adding-an-overlay)
        - [Modifying an Overlay](#modifying-an-overlay)
        - [Deleting an Overlay](#deleting-an-overlay)
    - [Additional Features](#additional-features)
5. [API Documentation](#api-documentation)
    - [Base URL](#base-url)
    - [Endpoints](#endpoints)
        - [Manage Overlays](#1-manage-overlays)
            - [Create Overlay](#a-create-overlay)
            - [Get All Overlays](#b-get-all-overlays)
            - [Update Overlay](#c-update-overlay)
            - [Delete Overlay](#d-delete-overlay)
        - [Stream Management](#2-stream-management)
            - [Start Livestream](#a-start-livestream)
6. [Pushing the Project to GitHub](#pushing-the-project-to-github)
7. [Troubleshooting](#troubleshooting)
8. [Contributing](#contributing)
9. [License](#license)
10. [Contact](#contact)

---

## Overview

The **Livestream Overlay Manager** is a web application that enables users to manage overlays on a livestream video feed. Users can input an RTSP URL to stream live video and create overlays that can be positioned, modified, or deleted as needed. This tool is particularly useful for live broadcasts, webinars, and surveillance applications where dynamic information display is required.

---

## Prerequisites

Before setting up the application, ensure you have the following installed on your system:

- **Python** (version 3.6 or higher)
- **Node.js** (version 12 or higher)
- **pip** (Python package installer)
- **npm** (Node package manager)
- **FFmpeg** (for transcoding streams)

### Installing FFmpeg

FFmpeg is essential for transcoding RTSP streams to a browser-compatible format like HLS. Follow the instructions below to install FFmpeg based on your operating system:

- **Windows**:
    1. Download the latest static build from [FFmpeg Downloads](https://ffmpeg.org/download.html).
    2. Extract the downloaded ZIP file.
    3. Add the `bin` folder to your system's PATH environment variable.

- **macOS**:
    ```bash
    brew install ffmpeg
    ```

- **Linux (Ubuntu/Debian)**:
    ```bash
    sudo apt update
    sudo apt install ffmpeg
    ```

---

## Setting Up the Application

Follow the steps below to set up both the backend and frontend of the application.

### Clone the Repository

1. Open your terminal or command prompt.
2. Clone the repository using `git`:

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

    Replace `<repository-url>` with the actual URL of your repository and `<project-directory>` with the desired directory name.

### Backend Setup

1. **Navigate to the Backend Directory**:

    ```bash
    cd api
    ```

2. **Create a Virtual Environment (Optional but Recommended)**:

    ```bash
    python -m venv venv
    ```

3. **Activate the Virtual Environment**:

    - **Windows**:
        ```bash
        venv\Scripts\activate
        ```
    - **macOS/Linux**:
        ```bash
        source venv/bin/activate
        ```

4. **Install Required Python Packages**:

    ```bash
    pip install -r requirements.txt
    ```

5. **Configure Environment Variables**:

    Create a `.env` file in the `api` directory and add your MongoDB connection string:

    ```env
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.m9f7l.mongodb.net/livestream_db?retryWrites=true&w=majority
    ```

    Replace `<username>` and `<password>` with your actual MongoDB Atlas credentials.

6. **Run the Flask Application**:

    ```bash
    python app.py
    ```

    The backend server should now be running at `http://localhost:5000`.

### Frontend Setup

1. **Navigate to the Frontend Directory**:

    ```bash
    cd frontend
    ```

2. **Install Required Node Packages**:

    ```bash
    npm install
    ```

3. **Run the React Application**:

    ```bash
    npm start
    ```

    The frontend should now be accessible at `http://localhost:3000`.

---

## Using the Application

Once both the backend and frontend are set up and running, follow the instructions below to use the application effectively.

### Inputting the RTSP URL

#### Step-by-Step Instructions

1. **Open the Application**:

    - Navigate to `http://localhost:3000` in your web browser.

2. **Locate the RTSP URL Input Field**:

    - At the top of the page, you'll find an input field labeled **RTSP or HTTP URL**.

3. **Enter a Valid RTSP Stream URL**:

    - Input a valid RTSP URL into the field. Ensure the URL is accessible from your network.

4. **Start Streaming**:

    - Click the **Play Livestream** button to start streaming.
    - If the URL is an RTSP stream, the backend will transcode it to HLS, and the stream will appear in the video player.
    - If the URL is an HTTP stream (like an MP4 file or HLS `.m3u8`), the video will play directly without transcoding.

#### Sample RTSP URLs

For testing purposes, you can use the following publicly available RTSP streams:

1. **Big Buck Bunny RTSP (Publicly Available)**:
    ```
    rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov
    ```

2. **Wowza Test RTSP**:
    ```
    rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov
    ```

3. **Alternate RTSP Streams**:
    - Explore more test streams from [RTSP Test Streams](https://www.rtsp-stream.com/examples.html).

**Note**: Public RTSP streams may occasionally be unavailable. For a more reliable setup, consider setting up a local RTSP server using tools like **VLC Media Player** or **FFmpeg**.

---

### Managing Overlays

Overlays allow you to display dynamic text or graphics on your livestream. Here's how to manage them:

#### Adding an Overlay

1. **Open Overlay Settings**:

    - Click on the **Settings** button located near the top of the application interface. This will open the **Overlay Settings** modal.

2. **Enter Overlay Text**:

    - In the **Overlay Text** input field within the modal, type the text you want to display on the livestream.

3. **Add the Overlay**:

    - Click the **Add Overlay** button. The new overlay will appear on the video stream at the default position.

#### Modifying an Overlay

1. **Access Modify Options**:

    - In the **Overlay Settings** modal, locate the overlay you wish to modify.
    - Click the **Modify** button (often represented by an edit icon) next to the overlay.

2. **Edit Overlay Details**:

    - A **Modify Overlay** modal will appear.
    - Update the **Overlay Text**, **Position (X, Y)**, and **Size (Width, Height)** as desired.

3. **Save Changes**:

    - Click the **Save Changes** button to apply the modifications. The overlay on the livestream will update accordingly.

4. **Drag to Reposition (Optional)**:

    - You can also drag the overlay directly on the video to reposition it. Changes are saved automatically upon releasing the overlay.

#### Deleting an Overlay

1. **Access Delete Options**:

    - In the **Overlay Settings** modal, locate the overlay you wish to delete.
    - Click the **Delete** button (often represented by a trash icon) next to the overlay.

2. **Confirm Deletion**:

    - A confirmation prompt will appear. Click **OK** or **Confirm** to proceed with deletion.

3. **Overlay Removal**:

    - The overlay will be removed from both the backend and the livestream video.

---

### Additional Features

- **Toggle Overlay Visibility**:

    - Within the **Overlay Settings** modal, each overlay has a checkbox. Checking or unchecking this box will show or hide the respective overlay on the livestream.

- **Responsive Design**:

    - The application is designed to be responsive and should function well on various screen sizes, including desktops, tablets, and mobile devices.

- **User Notifications**:

    - The application provides real-time notifications (toasts) for actions like adding, modifying, or deleting overlays, enhancing user feedback.

- **Styling and Customization**:

    - Overlays have semi-transparent backgrounds and are styled for better visibility over the video content. You can further customize overlay styles (like fonts and colors) within the application settings or by modifying the code.

---



