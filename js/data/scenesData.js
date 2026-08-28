export const SCENES = Object.freeze([
  Object.freeze({
    id: "master_bedroom_v2",
    name_ar: "غرفة النوم الرئيسية — المرجع الأوحد",
    name_en: "master bedroom v2 (single master reference)",
    image_url: "scenes/master_bedroom_v2.svg",
    image_filename: "master_bedroom_v2.jpg",
    canonical_image_path: "scenes/master_bedroom_v2.jpg",
    region: "master_bedroom",
    priority: 100,
    visible_features: Object.freeze([
      "bed","headboard","nightstand_door","lamp","nightstand_far",
      "sofa","chair_corner","rug","wardrobe_mirror","dresser_mirror",
      "curtain_blackout","ac","door","tile_floor","ceiling_spots",
      "mattress","mattress_edge","pillow","blanket","nightstand",
      "sofa_cushion","sofa_back","sofa_armrest","chair","chair_seat","chair_back",
      "floor","wardrobe","wardrobe_doors","vanity_mirror","vanity_table",
      "full_room_overview","ceiling_light"
    ]),
    surfaces: Object.freeze([
      "floor","mattress","mattress_edge","pillow","headboard",
      "sofa_cushion","sofa_back","sofa_armrest","chair_seat","chair_back",
      "wardrobe","vanity"
    ]),
    supported_poses: Object.freeze([
      "lying_back","lying_right_side","lying_left_side","lying_stomach",
      "semi_reclining","sitting_bed_edge","sitting_sofa","sitting_chair","sitting_floor",
      "standing_center","standing_bedside","standing_sofa","standing_wardrobe","standing_vanity",
      "standing_dresser","mirror_selfie","mirror_wardrobe","mirror_dresser"
    ]),
    supported_directions: Object.freeze([
      "any","toward_ceiling","toward_lamp","toward_vanity","toward_sofa","toward_bed",
      "facing_room","facing_right","facing_left","facing_wardrobe","side_to_wardrobe","facing_mirror"
    ]),
    camera_angles: Object.freeze(["eye_level","high_angle","low_angle"]),
    camera_distances: Object.freeze(["close","medium","wide"]),
    base_camera_angle: "eye_level",
    base_camera_distance: "medium",
    default_for_poses: Object.freeze([
      "lying_back","lying_right_side","lying_left_side","lying_stomach","semi_reclining",
      "sitting_bed_edge","sitting_sofa","sitting_chair","sitting_floor",
      "standing_center","standing_bedside","standing_sofa","standing_wardrobe","standing_vanity","mirror_selfie"
    ]),
    spatial_map: Object.freeze({
      bed: "left wall; headboard west; lamp on near-door nightstand (subject's LEFT when lying supine)",
      sofa: "back wall against blackout curtain, facing into the room; walkway clear in front",
      chair: "back-left corner angled ~45°; seat FREE; yellow/black jacket on backrest",
      wardrobe: "right wall; mirrored sliding doors; hanging white thobes",
      dresser: "right side; dark-wood chest with mirror above",
      rug: "center between bed and sofa; floor-sitting zone",
      door: "foreground; the selfie viewpoint axis"
    }),
    fingerprint: Object.freeze([
      "sofa: charcoal 3-seat, 2 gray + 1 beige cushions, beige throw over right arm, wooden legs",
      "bed: gray duvet smoothed with dark runner stripe; white throw FOLDED at foot; 2 gray pillows",
      "chair: yellow/black jacket draped on backrest; backpack leaning at leg",
      "footwear: brown sandals + black slides near bed edge; white sneakers on rug; brown sneakers on tile right of rug",
      "nightstand_door: lit warm lamp, power strip + chargers + cables, closed laptop, water bottles, remote",
      "shell: recessed cool ceiling spots ON; white split AC top-left; closed black blackout curtain; glossy light tile"
    ])
  })
]);

export const SCENE_BY_ID = Object.freeze({ master_bedroom_v2: SCENES[0] });

if (typeof window !== "undefined") window.SCENES = SCENES;
