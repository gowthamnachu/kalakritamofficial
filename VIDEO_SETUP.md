# Video Setup Instructions

## Adding Your Intro Video

To add your intro video to the Kalakritam website:

1. Place your video file in the `public` folder
2. Supported formats: MP4, WebM, OGG
3. Recommended: MP4 format for best browser compatibility
4. Update the video source in `src/components/IntroVideo.jsx`

Example video file placement:
```
public/
  intro-video.mp4
```

Then update the video source in IntroVideo.jsx:
```jsx
<source src="/intro-video.mp4" type="video/mp4" />
```

## Video Specifications

For optimal performance:
- Resolution: 1920x1080 (Full HD)
- Format: MP4 (H.264 codec)
- Duration: 3-10 seconds recommended
- File size: Keep under 10MB for fast loading

The video will automatically play when the page loads and redirect to the home page when finished.
