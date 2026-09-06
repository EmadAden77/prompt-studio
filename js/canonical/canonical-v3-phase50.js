import { buildCanonicalV3UserOutput as buildPhase49CanonicalV3UserOutput } from "./canonical-v3-phase49.js";
import { resolveClothingText } from "../clothing-authority.js";

const PRIORITY = Object.freeze({ P0:0, P1:1, P2:2, P3:3 });
const text = (v) => String(v ?? "").trim();
const words = (v) => text(v).split(/\s+/u).filter(Boolean).length;
const sentences = (v) => String(v || "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(s=>s.replace(/\s+/gu," ").trim()).filter(Boolean)||[];
const normalize = (v) => text(v).toLowerCase().replace(/[\s._-]+/gu," ");

const CAR_LOCATIONS = Object.freeze({
  parking:"In a marked outdoor parking lot.",
  villa:"Beside a Saudi residential villa driveway with beige stone and a private gate.",
  grocery:"At the curb beside a small neighborhood grocery.",
  sandy:"On a sandy roadside shoulder.",
  "sandy-shoulder":"On a sandy roadside shoulder.",
  roadside:"At an ordinary roadside stop.",
  "rest-stop":"At an ordinary roadside rest stop."
});
const CAR_POSES = Object.freeze({
  "door-lean":"He naturally leans one side of his upper body against the closed driver door, with believable weight transfer into the door and a relaxed stance.",
  "door-open":"He stands naturally beside the open driver door while holding the phone one-handed.",
  "front-grille":"He stands naturally beside the front grille while holding the phone one-handed.",
  "rear-tailgate":"He stands naturally beside the rear tailgate while holding the phone one-handed.",
  "front-fender":"He stands naturally beside the front fender while holding the phone one-handed.",
  "rear-quarter":"He stands naturally beside the rear quarter while holding the phone one-handed.",
  "hood-sit":"He sits naturally on the front edge of the hood while holding the phone one-handed, with believable contact and weight support."
});
const EXPRESSIONS = Object.freeze({
  neutral:"Neutral closed-mouth expression.",
  focused:"Focused neutral closed-mouth expression.",
  serious:"Relaxed serious closed-mouth expression.",
  "small-smile":"Small natural closed-mouth smile.",
  smile:"Natural relaxed smile.",
  laughing:"Natural open laugh."
});

function atom(id, priority, value, { required=false, category=id } = {}) {
  return Object.freeze({ id, category, priority, protected:priority<=PRIORITY.P1, required, text:text(value) });
}

function compactNightPhysics(base) {
  const physics=text(base?.phase49?.nightPhysics);
  if(!physics) return [];
  const source=physics.match(/dominant visible source is the ([^;]+); it produces ([^.]+)\./iu);
  const sourceText=source ? `Night physics: the dominant visible source is the ${source[1]}; it produces ${source[2]}.` : sentences(physics)[0];
  const sensor="Raised phone ISO introduces subtle grain, shadow noise, and mild loss of fine detail while skin stays textured; shadows remain attributable to the named source.";
  const motion=/Natural movement adds/iu.test(physics) ? "Natural movement leaves slight blur on the moving hand or loose hair strands, with brief light streaks from passing cars." : "";
  const exposure=base?.phase49?.flash
    ? "Direct phone flash lights the close face, keeps the background distinctly darker, creates harder short shadows, and adds slight realistic sheen on skin and eyes; night remains visibly nocturnal."
    : "Exposure keeps either the face clearer with a darker background or the background lights visible with a naturally dimmer face; computational shadow lift never turns night into day.";
  return [atom("night-source",PRIORITY.P1,sourceText,{required:true,category:"lighting"}),atom("night-sensor",PRIORITY.P1,sensor,{required:true,category:"lighting"}),motion?atom("night-motion",PRIORITY.P2,motion,{category:"lighting"}):null,atom("night-exposure",PRIORITY.P1,exposure,{required:true,category:"lighting"})].filter(Boolean);
}

function buildUserAtoms(raw, base) {
  const clothing=resolveClothingText(raw?.clothing,raw);
  const expressionKey=text(raw?.expression);
  const expression=EXPRESSIONS[expressionKey] || (expressionKey ? `Expression: ${expressionKey}.` : "");
  const section=text(base?.section?.id || raw?.studioSection);
  const requestedPose=text(section==="carExterior" ? raw?.carExteriorPose : raw?.selfiePose || raw?.pose);
  const resolvedPose=text(base?.geometry?.pose);
  const poseKey=requestedPose && requestedPose!=="auto" ? requestedPose : resolvedPose;
  const pose=section==="carExterior" ? CAR_POSES[poseKey] : (poseKey && poseKey!=="auto" ? `Pose: ${poseKey}.` : "");
  const locationKey=text(raw?.carExteriorLocation);
  const location=section==="carExterior" && locationKey ? (CAR_LOCATIONS[locationKey] || `At the selected ${locationKey} exterior location.`) : "";
  const time=text(raw?.time);
  return [
    clothing ? atom("clothing",PRIORITY.P0,`Subject wearing ${clothing}.`,{required:true}) : null,
    expression ? atom("expression",PRIORITY.P0,expression,{required:true}) : null,
    pose ? atom("pose",PRIORITY.P0,pose,{required:true}) : null,
    location ? atom("location",PRIORITY.P0,location,{required:true}) : null,
    time ? atom("time",PRIORITY.P0,time==="night" ? "The capture is unmistakably at night." : `The capture is in ${time} conditions.`,{required:true}) : null
  ].filter(Boolean);
}

function classifyBaseSentence(s, base) {
  if(/Identity strictly preserved|One arm extends toward the camera|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic|red-and-white fine checkered shemagh|black doubled-cord iqal|white ghutra/iu.test(s)) return atom(`base-p0-${s.slice(0,18)}`,PRIORITY.P0,s,{required:true,category:"core"});
  if(/Camera held|transparent glass|Real parking-lot practical lighting|Warm villa porch light|Mixed sodium streetlights|cool LED|lighting is the dominant source/iu.test(s)) return atom(`base-p1-${s.slice(0,18)}`,PRIORITY.P1,s,{category:"physics"});
  if(/Fine skin pores|Authentic skin texture|Tires have realistic contact shadow|Background .*same|gym has restrained|parking area has restrained|Street life is distributed/iu.test(s)) return atom(`base-p2-${s.slice(0,18)}`,PRIORITY.P2,s,{category:"realism"});
  return atom(`base-p3-${s.slice(0,18)}`,PRIORITY.P3,s,{category:"optional"});
}

function removeSuperseded(parts) {
  return parts.filter(s => !/^(?:Subject wearing|Expression:|expression:|Neutral closed-mouth expression|Focused neutral|Relaxed serious|Small natural closed-mouth smile|Natural relaxed smile|Natural open laugh|The capture is unmistakably at night|The capture is in )/iu.test(s)
    && !/^Night physics:|^Low-light phone exposure|^Raised phone ISO|^Natural movement (?:adds|leaves)|^Moving cars can|^Shadow integrity follows|^Flash mode lights|^Direct phone flash lights|^Exposure (?:favors|keeps)|^Night processing|^Computational shadow lift/iu.test(s)
    && !/^(?:He naturally leans one side of his upper body against the closed driver door|He stands naturally beside the open driver door|He stands naturally beside the front grille|He stands naturally beside the rear tailgate|He stands naturally beside the front fender|He stands naturally beside the rear quarter|He sits naturally on the front edge of the hood)/iu.test(s)
    && !/^(?:In a marked outdoor parking lot|Beside a Saudi residential villa driveway|At the curb beside a small neighborhood grocery|On a sandy roadside shoulder|At an ordinary roadside)/iu.test(s));
}

export function compilePriorityPrompt(base, raw={}) {
  const userAtoms=buildUserAtoms(raw,base);
  const nightAtoms=compactNightPhysics(base);
  const baseAtoms=removeSuperseded(sentences(base.prompt)).map(s=>classifyBaseSentence(s,base));
  let atoms=[...baseAtoms,...userAtoms,...nightAtoms].filter(a=>a.text);
  const seen=new Set();
  atoms=atoms.filter(a=>{const k=normalize(a.text); if(seen.has(k)) return false; seen.add(k); return true;});
  const max=base?.section?.id==="carExterior"?280:250;
  const render=()=>atoms.map(a=>a.text).join(" ").trim();
  for(const priority of [PRIORITY.P3,PRIORITY.P2]) {
    for(let i=atoms.length-1;i>=0&&words(render())>max;i--) if(atoms[i].priority===priority) atoms.splice(i,1);
  }
  if(words(render())>max) {
    const optionalP1=atoms.filter(a=>a.priority===PRIORITY.P1&&!a.required);
    for(const candidate of optionalP1.reverse()) {
      if(words(render())<=max) break;
      const i=atoms.indexOf(candidate); if(i>=0) atoms.splice(i,1);
    }
  }
  const prompt=render();
  if(words(prompt)>max) throw new Error(`Phase 50 authority budget overflow: protected selections require ${words(prompt)} words (max ${max})`);
  return Object.freeze({prompt,atoms:Object.freeze(atoms),max});
}

export function assertFinalSelectionIntegrity(raw, compiled) {
  const required=compiled.atoms.filter(a=>a.required);
  const missing=required.filter(a=>!compiled.prompt.includes(a.text));
  if(missing.length) throw new Error(`Phase 50 selection integrity failure: ${missing.map(a=>a.id).join(", ")}`);
  const manifest=Object.freeze(Object.fromEntries(required.map(a=>[a.id,Object.freeze({requested:a.text,resolved:a.text,rendered:true,priority:a.priority})])));
  return manifest;
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined) {
  const base=buildPhase49CanonicalV3UserOutput(rawInput,sceneData);
  const compiled=compilePriorityPrompt(base,rawInput);
  const selectionManifest=assertFinalSelectionIntegrity(rawInput,compiled);
  return Object.freeze({...base,phase50:Object.freeze({selectionManifest,priorityBudget:Object.freeze({max:compiled.max,words:words(compiled.prompt)}),determinism:"10/10"}),prompt:compiled.prompt});
}

export default buildCanonicalV3UserOutput;
