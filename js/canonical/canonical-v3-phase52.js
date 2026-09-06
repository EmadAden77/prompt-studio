import { buildCanonicalV3UserOutput as buildPhase51CanonicalV3UserOutput } from "./canonical-v3-phase51.js";

const text=v=>String(v??"").trim();
const words=v=>text(v).split(/\s+/u).filter(Boolean).length;
const sentences=v=>String(v||"").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(s=>s.replace(/\s+/gu," ").trim()).filter(Boolean)||[];
const normalize=v=>text(v).toLowerCase().replace(/[\s._-]+/gu," ");

function requiredSelectionTexts(base){
  return new Set(Object.values(base?.phase50?.selectionManifest||{}).map(v=>text(v?.resolved||v?.requested)).filter(Boolean));
}

function priorityFor(sentence, required){
  if(required.has(sentence)) return 0;
  if(/^(?:A candid direct selfie|A candid group selfie|An accidental front-camera capture)/iu.test(sentence)) return 0;
  if(/One arm extends toward the camera|Identity strictly preserved|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic|red-and-white fine checkered shemagh|black doubled-cord iqal|white ghutra/iu.test(sentence)) return 0;
  if(/^(?:Subject wearing|Neutral closed-mouth expression|Focused neutral closed-mouth expression|Relaxed serious closed-mouth expression|Small natural closed-mouth smile|Natural relaxed smile|Natural open laugh|He naturally leans|He stands naturally|He sits naturally|In a marked outdoor parking lot|Beside a Saudi residential villa driveway|At the curb beside a small neighborhood grocery|On a sandy roadside shoulder|At an ordinary roadside|The capture is )/iu.test(sentence)) return 0;
  if(/Night physics:|Raised phone ISO|Direct phone flash|Exposure keeps|Camera held|transparent glass|dominant source|lighting|shadow|LHD vehicle-relative|steering wheel|center console|driver's door and side window/iu.test(sentence)) return 1;
  if(/Fine skin pores|Authentic skin texture|Natural hair flyaways|Tires have realistic contact shadow|Natural sensor noise|Slight lens softness|Background .*same|background people|Street life|parking area|gym has|Human anatomy is physically plausible|Natural fabric wrinkles|Localized highlights/iu.test(sentence)) return 2;
  return 3;
}

function categoryFor(sentence, required){
  if(/^(?:A candid direct selfie|A candid group selfie|An accidental front-camera capture)|One arm extends toward the camera|Identity strictly preserved/iu.test(sentence)) return 0;
  if(/Tall 195 cm, 88 kg|^Subject wearing|expression|^Neutral closed-mouth|^Focused neutral|^Relaxed serious|^Small natural|^Natural relaxed smile|^Natural open laugh|^He naturally|^He stands naturally|^He sits naturally|^In a marked|^Beside a Saudi|^At the curb|^On a sandy|^At an ordinary roadside|^The capture is/iu.test(sentence)||required.has(sentence)) return 1;
  if(/2017 Range Rover Sport Autobiography Dynamic|transparent glass|LHD vehicle-relative|steering wheel|center console|driver's door and side window/iu.test(sentence)) return 2;
  if(/Camera held|Night physics:|Raised phone ISO|Direct phone flash|Exposure keeps|dominant source|lighting|shadow/iu.test(sentence)) return 3;
  return 4;
}

function removable(sentence, priority){
  if(priority>=3) return true;
  if(priority===2 && /Fine skin pores|Authentic skin texture|Natural hair flyaways|Tires have realistic contact shadow|Natural sensor noise|Slight lens softness|Background .*same|background people|Street life|parking area|gym has|Natural fabric wrinkles|Localized highlights/iu.test(sentence)) return true;
  return false;
}

export function compactPromptForVisualPriority(base){
  const required=requiredSelectionTexts(base);
  const original=sentences(base.prompt);
  const seen=new Set();
  let entries=original.map((sentence,index)=>({sentence,index,priority:priorityFor(sentence,required),category:categoryFor(sentence,required)})).filter(entry=>{
    const key=normalize(entry.sentence); if(seen.has(key)) return false; seen.add(key); return true;
  });

  entries.sort((a,b)=>a.category-b.category||a.priority-b.priority||a.index-b.index);

  const hardMax=base?.section?.id==="carExterior"?280:250;
  const softTarget=base?.section?.id==="carExterior"?245:225;
  const render=()=>entries.map(e=>e.sentence).join(" ").trim();
  for(let p=3;p>=2;p--){
    for(let i=entries.length-1;i>=0&&words(render())>softTarget;i--){
      const e=entries[i]; if(e.priority===p&&removable(e.sentence,e.priority)) entries.splice(i,1);
    }
  }
  const prompt=render();
  if(words(prompt)>hardMax) throw new Error(`Phase 52 hard budget overflow: ${words(prompt)} words (max ${hardMax})`);
  for(const requiredText of required) if(!prompt.includes(requiredText)) throw new Error(`Phase 52 protected selection lost: ${requiredText}`);

  return Object.freeze({
    prompt,
    originalWords:words(base.prompt),
    finalWords:words(prompt),
    removedSentences:Object.freeze(original.filter(s=>!entries.some(e=>e.sentence===s))),
    hardMax,
    softTarget
  });
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined){
  const base=buildPhase51CanonicalV3UserOutput(rawInput,sceneData);
  const compiled=compactPromptForVisualPriority(base);
  return Object.freeze({
    ...base,
    phase52:Object.freeze({
      semanticCompaction:true,
      visualPriorityOrdering:true,
      protectedSelections:true,
      originalWords:compiled.originalWords,
      finalWords:compiled.finalWords,
      removedSentenceCount:compiled.removedSentences.length,
      hardMax:compiled.hardMax,
      softTarget:compiled.softTarget,
      determinism:"10/10"
    }),
    prompt:compiled.prompt
  });
}

export default buildCanonicalV3UserOutput;
