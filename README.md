# ⚛️ 3D Atom Modeling

An interactive web application for visualizing and modeling the structure of atoms in 3D space. The project allows you to visually study the structure of an atom by manipulating protons, neutrons, and electron clouds.

![App Screenshot](src/assets/electron_enveloping.png)

## ✨ Features

### Particles and Elements
*   🔴 **Proton**: An atomic nucleus particle in the shape of a torus.
*   🔵 **Neutron**: A neutral nucleus particle.
*   ☁️ **Electron**: Represented as a voluminous semi-transparent "cloud" (a large torus) that envelops the nucleus.
*   💙 **Arrow**: A decorative element to indicate bonds or directions.

### Interactivity
*   **Free Placement**: Add particles and arrows anywhere in space.
*   **Group Selection**: Select multiple objects via Shift+Click or selection box (under development) to move them together.
*   **Smart Gizmo (3 modes)**: Click on an already selected object to toggle transformation modes:
    1.  ↔️ **Translate**
    2.  🔄 **Rotate**
    3.  📐 **Scale**
*   **Customizable Snapping**: In the control panel, you can set the move step (e.g., 0.5) and rotation angle (e.g., 15°). A value of 0 disables snapping.
*   **Color and Emissive Settings**: Ability to change the base color and emissive color (gradient) for any selected elements.
*   **Undo/Redo**: Full action history (Ctrl+Z / Ctrl+Shift+Z).

## 🎮 Controls

| Key / Action | Function |
|-------------------|---------|
| **LMB + Drag** (on background) | Rotate camera around the scene |
| **Mouse Wheel** | Zoom In / Out |
| **Click** (on object) | Select object. Clicking again changes Gizmo mode |
| **Gizmo** (arrows/arcs/cubes) | Translate / Rotate / Scale |
| **Shift + Click** | Multi-selection |
| **Ctrl + D** | Duplicate selected objects |
| **Delete / Backspace** | Delete selected objects |
| **Ctrl + Z** | Undo action |
| **Ctrl + Shift + Z** | Redo action |

---
*The project was created for educational purposes and visualization of the microworld.*
