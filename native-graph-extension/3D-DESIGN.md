# 3D design notes

The overlay uses a small isometric cube for every native GitHub tile:

- the top face keeps the contribution level readable
- the two side faces create the raised 3D effect
- block height increases with contribution intensity
- the snake uses a neon green gradient, glow, shadow, and a 3D-style head
- the pass orders positive tiles from level 1 through level 4

This is intentionally drawn with inline SVG and CSS so it needs no CDN, framework, or external image service.
