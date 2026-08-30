export function renderScenePicker({ container, scenes, selectedSceneId, poseLabels = {}, onSelect }) {
  const fragment = document.createDocumentFragment();
  const orderedScenes = [...scenes].sort((a, b) => (
    Number(Boolean(b.text_reference)) - Number(Boolean(a.text_reference))
    || (b.priority ?? 0) - (a.priority ?? 0)
  ));

  orderedScenes.forEach((scene) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `scene-option${scene.id === selectedSceneId ? " is-selected" : ""}`;
    button.dataset.sceneId = scene.id;
    if (scene.text_reference) button.dataset.textReference = "true";

    const visual = document.createElement("span");
    visual.className = "scene-option__visual";
    if (scene.text_reference) {
      const marker = document.createElement("span");
      marker.className = "scene-option__text-reference";
      marker.textContent = "🏠";
      marker.setAttribute("aria-label", "مرجع نصي بدون صورة");
      visual.append(marker);
    } else {
      const image = document.createElement("img");
      image.src = scene.image_url;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.src = "assets/scene-placeholder.svg";
        image.classList.add("is-placeholder");
      }, { once: true });
      visual.append(image);
    }

    const body = document.createElement("span");
    body.className = "scene-option__body";
    const name = document.createElement("strong");
    name.textContent = scene.name_ar;
    const filename = document.createElement("small");
    filename.textContent = scene.text_reference ? "🏠 بدون صورة" : scene.image_filename;
    const meta = document.createElement("small");
    const compatiblePoseIds = scene.compatiblePoseIds ?? scene.supported_poses ?? [];
    const suggestedPoseName = poseLabels[scene.suggestedPoseId] ?? scene.suggestedPoseId;
    const compatiblePoseNames = compatiblePoseIds
      .map((poseId) => poseLabels[poseId] ?? poseId)
      .join("، ");
    meta.textContent = scene.text_reference
      ? "مرجع غرفة نصي ثابت — لا يلزم IMAGE B"
      : suggestedPoseName
        ? `المقترحة: ${suggestedPoseName} • المتوافقة: ${compatiblePoseNames}`
        : `${compatiblePoseIds.length} وضعيات • ${scene.camera_angles.length} زوايا`;
    body.append(name, filename, meta);

    const check = document.createElement("span");
    check.className = "scene-option__check";
    check.textContent = "✓";
    button.append(visual, body, check);
    button.addEventListener("click", () => onSelect(scene.id));
    fragment.append(button);
  });

  container.replaceChildren(fragment);
}
