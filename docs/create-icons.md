# Generate icons for Electron apps

The main application icon needs to be usable for multiple operating systems, as well as in project documentation and social media linking.

1. Create a SVG file.
2. Size it to 48×48px.
3. Add a 1px-Grid, with a major grid line every 3px, resulting in a 16×16 raster.
4. Consider [design guidelines for Windows app icons](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icon-design).
5. Generate the Electron icons using [Electron Icon Generator](https://webutils.io/tool/electron-icon-generator).  
   This will create icons as defined by [Electron Forge - Custom App Icons](https://www.electronforge.io/guides/create-and-add-icons).

## Create SVG icon sprite

For icons in the application, use the general icon spite.

1. Create a new icon in `assets/gui/icons`. The filename has to start with `icon-`.  
   Use icon naming compatible to https://icons.getbootstrap.com/.
2. Open https://svgsprit.es/.
3. Drag all icons from the folder into the web app.
4. Download the resulting SVG file and replace `assets/gui/icons.svg` with it.

---

[Back to documentation index](./README.md) | [Back to top](../README.md)
