# Plot Coordinates Guide

This file explains how to update the plot coordinates in `plotCoordinates.json` to match your actual map image.

## JSON Structure

The `plotCoordinates.json` file contains:
- `imageWidth`: The original width of your map image in pixels
- `imageHeight`: The original height of your map image in pixels
- `plots`: Array of plot objects with coordinates

## Plot Object Structure

Each plot has:
```json
{
  "id": 1,                    // Plot number (must match PLOT_DATA keys)
  "type": "rectangle",        // Currently supports "rectangle"
  "coordinates": {
    "x": 50,                  // X position (top-left corner)
    "y": 100,                 // Y position (top-left corner)
    "width": 80,              // Width of the plot area
    "height": 60              // Height of the plot area
  },
  "center": {
    "x": 90,                  // Center X coordinate
    "y": 130                   // Center Y coordinate
  }
}
```

## How to Get Coordinates

### Method 1: Using Image Editing Software
1. Open your map image in an image editor (Photoshop, GIMP, etc.)
2. Note the image dimensions (width x height)
3. For each plot, note the top-left corner (x, y) and dimensions (width, height)
4. Update `imageWidth` and `imageHeight` in the JSON
5. Add/update plot coordinates

### Method 2: Using Browser DevTools
1. Open the map page in your browser
2. Right-click on the map image → Inspect
3. Use the element inspector to find plot positions
4. Note the coordinates relative to the image

### Method 3: Using a Coordinate Picker Tool
1. Create a simple HTML page with your image
2. Add JavaScript to log mouse coordinates on click
3. Click on each plot's corners to get coordinates
4. Calculate width/height from corner positions

## Example: Updating Coordinates

If your image is 1200x900 pixels and Plot 1 is at position (100, 150) with size 120x80:

```json
{
  "imageWidth": 1200,
  "imageHeight": 900,
  "plots": [
    {
      "id": 1,
      "type": "rectangle",
      "coordinates": {
        "x": 100,
        "y": 150,
        "width": 120,
        "height": 80
      },
      "center": {
        "x": 160,  // x + width/2
        "y": 190   // y + height/2
      }
    }
  ]
}
```

## Tips

1. **Coordinate System**: Uses top-left as origin (0,0), X increases right, Y increases down
2. **Precision**: More precise coordinates = better hover detection
3. **Overlapping**: If plots overlap, the first matching plot in the array will be detected
4. **Rotation**: The component handles rotation automatically, coordinates should be in the original image orientation

## Testing

After updating coordinates:
1. Save the JSON file
2. Refresh the page
3. Hover over plots to verify detection
4. Adjust coordinates if needed

## Future Enhancements

- Support for polygon shapes (irregular plots)
- Visual coordinate editor tool
- Import from image map HTML
- Export coordinates for sharing







