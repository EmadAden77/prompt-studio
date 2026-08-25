export function renderScenePicker({ container, scenes, selectedSceneId, poseLabels = {}, onSelect }) {
  const fragment = document.createDocumentFragment();

  scenes.forEach((scene) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `scene-option${scene.id === selectedSceneId ? " is-selected" : ""}`;
    button.dataset.sceneId = scene.id;

    const visual = document.createElement("span");
    visual.className = "scene-option__visual";
    const image = document.createElement("img");
    image.src = scene.image_url;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.src = "assets/scene-placeholder.svg";
      image.classList.add("is-placeholder");
    }, { once: true });
    visual.append(image);

    const body = document.createElement("span");
    body.className = "scene-option__body";
    const name = document.createElement("strong");
    name.textContent = scene.name_ar;
    const filename = document.createElement("small");
    filename.textContent = scene.image_filename;
    const meta = document.createElement("small");
    const compatiblePoseIds = scene.compatiblePoseIds ?? scene.supported_poses ?? [];
    const suggestedPoseName = poseLabels[scene.suggestedPoseId] ?? scene.suggestedPoseId;
    const compatiblePoseNames = compatiblePoseIds
      .map((poseId) => poseLabels[poseId] ?? poseId)
      .join("، ");
    meta.textContent = suggestedPoseName
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
