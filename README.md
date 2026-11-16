# Charlotte’s Playground

Charlotte’s work and life—sharing whatever I have the energy to share.

## Pages

- `index.html`: currently published personal site entry. Keep this page in place until the new homepage is approved.
- `homepage-hero.html`: current homepage Hero preview, including the ASCII animation. The animation is capped at 8 FPS.
- `homepage-wireframe.html`: earlier homepage wireframe.
- `hero-experiment.html`: earlier ASCII animation experiment.
- `works/roamee/index.html`: self-contained ROAMEE exhibition prototype.
- `works/roamee/source/`: editable ROAMEE HTML, CSS, JavaScript, data, build scripts, and referenced image assets. The public exhibition page above is the bundled output.

## Design system and source

The shared CSS lives in `assets/styles/`. `design-system.css` imports the tokens, typography, layout, icon, header, button, animation, and Hero styles. The homepage components live in `assets/scripts/`; vector assets are in `assets/brand/`, `assets/icons/`, and `assets/components/`.

This is a static site. Preview it with a local HTTP server from the repository root, or open the HTML pages through GitHub Pages. `homepage-hero.html` is a preview; it does not replace the published `index.html` yet.

## Continuing in Codex Cloud

Use this GitHub repository as the source. The latest homepage work is in `homepage-hero.html` and `assets/`. The ROAMEE source is in `works/roamee/source/`; its exhibition bundle is `works/roamee/index.html`. Future changes should be committed and pushed to GitHub so another computer or cloud task can see them. Confirm the homepage design before changing the public `index.html`.
