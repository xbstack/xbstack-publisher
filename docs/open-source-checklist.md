# Open Source Checklist

Use this checklist before each public release.

## Must Pass

- No private articles or internal content are included.
- No real `WENYAN_API_KEY`, `WECHAT_APP_ID`, or `WECHAT_APP_SECRET` is included.
- No real publishing history is included.
- `.env.example` contains placeholder values only.
- `data/publisher/jobs.json` is ignored by Git.
- `public/assets/uploads/*` is ignored by Git except `.gitkeep`.
- README clearly separates implemented features from planned features.
- WeChat publishing is documented as draft-box publishing through Wenyan Server.
- Zhihu, Juejin, and Xiaohongshu are documented as copy-export only.
- Apache-2.0 license is present.

## Release Notes Boundary

Do not describe these as completed until implemented:

- clipboard image paste;
- pasted image URL preview;
- remote image rehosting;
- drag-and-drop upload;
- video publishing;
- AI writing, layout, trend, inspiration, or analytics features.

