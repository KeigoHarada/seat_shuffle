# Onboarding

First visit shows a welcome overlay so a teacher can start a 3-minute tour or skip straight into the classroom editor. Skipping records onboarding complete in `localStorage` key `seat-shuffle-onboarding`.

## Sub-features

- `welcome-open` shows heading `ラクガエへようこそ！` on a fresh profile ~500ms after load.
- `welcome-skip` closes the overlay via `スキップ` or the close control and leaves the default classroom.
- `welcome-start-tour` starts the tour via `3分ガイドを始める` (mutates classroom toward tour steps).
- `guide-hub` reopens guidance from header `はじめてガイド` (`#header-guide-btn`).

## How to get to it (user POV)

- Load the app in a browser with no `seat-shuffle-onboarding` completion flag (new profile).
- Choose `スキップ` to use the editor immediately.
- Choose `3分ガイドを始める` to follow the tour overlay.
- Later, choose header `はじめてガイド` to open the guide hub.

## Driving it with control-rakugae

Preconditions:

- Fresh launch on this run's URL (new Chrome profile).
- Do **not** call `dismiss-welcome` before capturing `welcome-open`.
- `doctor` is green.

- **See welcome.** After `launch`, run `screenshot --path $EVIDENCE/onboarding-welcome.png` and `snapshot --path $EVIDENCE/onboarding-welcome.aria.txt` (optional `wait-text --text "ラクガエへようこそ！" --timeout 5000` first). Launch waits past the 500ms delay; the heading and buttons `スキップ` and `3分ガイドを始める` are visible; the ラクガエ logo remains in the header behind the overlay.
- **Start tour (optional).** `click --name "3分ガイドを始める"` does **not** auto-click `スキップ` first. Do not mix that mutated classroom into canvas proofs. For skip-path proof, use a fresh launch instead.
- **Skip.** Run `dismiss-welcome` (clicks `スキップ`). Re-run `count --selector ".seat-node-item"`. Overlay heading is gone; seat count is 30; settings heading `生徒設定` is visible.
- **Confirm persistence.** Reload via `eval` is not enough; run `eval --js "JSON.parse(localStorage.getItem('seat-shuffle-onboarding')||'{}').state.hasCompletedOnboarding"`. Value is `true`. A second `wait-text` for `ラクガエへようこそ！` must fail or the heading count is 0.
- **Guide hub.** Run `click --id header-guide-btn`. Hub UI opens from the header entry (`isGuideHubOpen` is in-memory; screenshot on the same session). Screenshot `$EVIDENCE/onboarding-guide-hub.png`.
- **Proof.** Artifacts show welcome then skipped editor with 30 `.seat-node-item` nodes. Do not claim tour completion unless you actually advanced tour steps.

## Gotchas

- Welcome is delayed 500ms (`OnboardingController`). `launch` and first navigation wait for the overlay; the run's Chrome session keeps it open so a later screenshot is not a false "no overlay" capture.
- `click`/`fill`/`count` skip auto-dismiss when the target is `スキップ`, `3分ガイドを始める`, or `ラクガエへようこそ！`.
- Overlay click-on-backdrop also skips; prefer the named `スキップ` button.
- `3分ガイドを始める` rewrites classroom state via tour `setupPreState`. Do not mix tour state into canvas-layout proofs.
- If a previous Chrome profile is reused, welcome will not appear. Isolation requires this run's `user-data-dir`.
