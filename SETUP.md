# Add the contribution snake to `Dibyansu33Gouda`

This folder is a ready-to-upload GitHub profile repository. It contains:

- `README.md` — the profile content, animated snake embed, and 3D contribution design
- `.github/workflows/snake.yml` — the daily snake generator
- `.github/workflows/profile-3d.yml` — the daily 3D contribution skyline generator
- `native-graph-extension/` — an optional browser extension that can draw the snake directly over the native GitHub calendar in your own browser

The 2D generator is based on [Platane/snk](https://github.com/Platane/snk). Its contribution colors are ordered as: no contribution, low, medium, high, and highest. The workflow publishes two theme-aware SVGs to an `output` branch. The 3D image workflow uses [github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib) and writes an isometric contribution skyline into `profile-3d-contrib/`.

## Important limitation

GitHub does not let a profile README modify the native contribution calendar component. The snake therefore appears in your profile README, directly above the native calendar, and uses the same contribution data. It is an animated contribution-grid game rather than a replacement for GitHub's built-in calendar.

## 1. Create the profile repository

1. Open [Create a new repository](https://github.com/new).
2. Set **Repository name** to exactly `Dibyansu33Gouda`.
3. Set the repository to **Public**.
4. Leave **Add a README file** unchecked; the supplied README will be pushed in the next step.
5. Create the repository.

GitHub only displays a profile README when the repository is public, its name exactly matches the username, and `README.md` is in its root.

## 2. Upload these files

### Recommended: Git

After extracting this folder, run:

```bash
cd Dibyansu33Gouda-profile
git init
git branch -M main
git add README.md .github/workflows/snake.yml .github/workflows/profile-3d.yml SETUP.md
git commit -m "Add animated snake and 3D contribution profile"
git remote add origin https://github.com/Dibyansu33Gouda/Dibyansu33Gouda.git
git push -u origin main
```

If Git asks for a password, use GitHub authentication or a personal-access-token-enabled Git client; GitHub no longer accepts an account password for Git pushes.

### GitHub website

You can also create `README.md` with the supplied contents using **Add file → Create new file**. Then create both `.github/workflows/snake.yml` and `.github/workflows/profile-3d.yml` with the supplied workflows. Keep the `.github/workflows` paths exactly as written. The `native-graph-extension` folder is not uploaded as a workflow; install it locally using its own README if you want the effect inside the native calendar.

## 3. Allow the workflow to publish

In the new `Dibyansu33Gouda` repository:

1. Open **Settings → Actions → General**.
2. Under **Workflow permissions**, select **Read and write permissions**.
3. Save the setting.

## 4. Run the workflows once now

Run both workflows manually the first time:

### Contribution snake

1. Open the repository's **Actions** tab.
2. Select **Generate contribution snake**.
3. Click **Run workflow → Run workflow**.
4. Wait for the green check mark.
5. Confirm that an `output` branch now contains `github-snake.svg` and `github-snake-dark.svg`.

### 3D contribution design

1. Return to the **Actions** tab.
2. Select **Generate 3D contribution profile**.
3. Click **Run workflow → Run workflow**.
4. Wait for the green check mark.
5. Confirm that `profile-3d-contrib/` contains generated SVG files.

Refresh `https://github.com/Dibyansu33Gouda` after both jobs finish. The scheduled runs keep both designs current every day.

The `push` trigger on the snake workflow also regenerates the snake when you update the profile README or workflow.

## 5. If you want it literally inside the native calendar

Install the optional extension in `native-graph-extension/`. It overlays the real GitHub calendar in your own browser with raised 3D blocks and an autoplaying neon snake. Read `native-graph-extension/README.md` for Chrome, Edge, and Firefox instructions.

## Customization

Edit the two `outputs` lines in `.github/workflows/snake.yml`:

- `color_snake` controls the snake color.
- `color_dots` contains exactly five colors, ordered from zero contribution through the highest contribution.
- `palette=github-light` and `palette=github-dark` keep the profile theme-aware.

For example, change `%23d4ff4f` to `%23ff7b72` for a coral snake. `%23` is the URL-encoded form of `#`; keep it in the workflow.

## Troubleshooting

- **Broken image after the first upload:** run the workflow manually; the image does not exist until the first successful run.
- **403 or permission error:** enable **Read and write permissions** in the repository Actions settings, then run it again.
- **No profile README:** check that the repository is named exactly `Dibyansu33Gouda`, is public, and contains a non-empty root `README.md`.
- **No new contributions shown:** the generator reflects GitHub's contribution data. It cannot invent or change contributions.
