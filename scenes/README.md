# Scene reference library

Place the real bedroom reference images in this directory using these exact filenames:

- `bed_right_nightstand.jpg`
- `bed_left_vanity.jpg`
- `bed_front_overview.jpg`
- `vanity_mirror.jpg`
- `sofa_area.jpg`
- `chair_area.jpg`
- `wardrobe_area.jpg`
- `room_center.jpg`

The application continues to work when a file is missing and displays a neutral placeholder. Scene metadata lives in `js/data/scenesData.js`.

When adding or replacing a reference:

1. Keep the filename synchronized with `image_url` and `image_filename` in `scenesData.js`.
2. Describe only features and support surfaces that are actually visible.
3. Add only poses, directions, angles, and distances that the photograph can physically support.
4. Never mark a mirror, lamp, chair, window, or support surface as visible unless it truly appears in the image.
5. Commit the image and metadata change together.

Recommended image format: JPEG or WebP, sRGB, 1600–2400 px on the long edge. Remove unnecessary private information before publishing a public reference image.
