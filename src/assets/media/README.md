# Media Repository

This folder contains all the videos and images used in the application.

## Structure

```
assets/media/
├── videos/          # All video files (.mp4, .mov, etc.)
├── images/          # All image files (.png, .jpg, etc.)
└── README.md        # This file
```

## Usage

When adding new media files:

1. **Videos**: Place them in `assets/media/videos/`
2. **Images**: Place them in `assets/media/images/`

Then reference them in the code using:
- For videos: `require('../../assets/media/videos/filename.mp4')`
- For images: `require('../../assets/media/images/filename.png')`

## Current Files

### Videos
- `sofiaa.mp4` - Onboarding introduction video
- `home.mp4` - Home screen background video

### Images
_(None yet)_

## Notes

- Keep file names descriptive and consistent
- Use lowercase with underscores for multi-word names (e.g., `intro_video.mp4`)
- Update this README when adding new files

