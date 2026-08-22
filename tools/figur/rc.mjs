#!/usr/bin/env node
// Recraft-runner v2 — Ink & Art. Noegle fra /tmp/.recraft_key (Bitwarden-sluse).
import { readFileSync, writeFileSync } from "node:fs";
import { extname, basename, dirname, join } from "node:path";
const BASE = "https://external.api.recraft.ai/v1";
// README beder dig saette RECRAFT_KEY_FILE, og curl-trinnet bruger den. Den her
// fil gjorde ikke — stien var hardkodet, saa halvdelen af opskriften adloed
// variablen og den anden halvdel crashede paa en fil der ikke fandtes.
const KEY_FILE = process.env.RECRAFT_KEY_FILE ?? "/tmp/.recraft_key";
let KEY;
try { KEY = readFileSync(KEY_FILE,"utf8").trim(); }
catch { console.error(`ingen noegle i ${KEY_FILE} — saet RECRAFT_KEY_FILE, hent noeglen fra Bitwarden (ALDRIG fra repo/chat)`); process.exit(1); }
const MIME={".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".svg":"image/svg+xml",".webp":"image/webp"};
const dataUrl=p=>`data:${MIME[extname(p).toLowerCase()]??"image/png"};base64,${readFileSync(p).toString("base64")}`;
async function call(path, body, method="POST"){
  const r=await fetch(BASE+path,{method,headers:{Authorization:`Bearer ${KEY}`,...(body?{"Content-Type":"application/json"}:{})},
    body:body?JSON.stringify(body):undefined, signal:AbortSignal.timeout(180_000)});
  const t=await r.text();
  if(!r.ok) throw new Error(`${method} ${path} ${r.status}: ${t.slice(0,500)}`);
  return JSON.parse(t);
}
const credits=async()=>(await call("/users/me",null,"GET")).credits;
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d;};
const [cmd]=process.argv.slice(2);

if(cmd==="styles"){ console.log(JSON.stringify(await call("/styles",null,"GET"),null,2)); }
else if(cmd==="credits"){ console.log(await credits()); }
else if(cmd==="create-style"){
  const raw=process.argv.slice(3); const files=[];
  for(let i=0;i<raw.length;i++){ if(raw[i].startsWith("--")){i++;continue;} files.push(raw[i]); }
  const base=arg("--base","vector_illustration");
  const out=await call("/styles",{style:base,image_urls:files.map(dataUrl)});
  console.log("style_id:",out.id??JSON.stringify(out));
}
else if(cmd==="gen"){
  const prompt=arg("--p"), out=arg("--o"), n=+arg("--n",1);
  const styleId=arg("--style-id"), style=arg("--style","vector_illustration");
  const size=arg("--size","1024x1024"), neg=arg("--neg");
  const before=await credits();
  const body={prompt,model:arg("--model","recraftv4_1"),size,n,response_format:"url"};
  if(styleId) body.style_id=styleId; else body.style=style;
  if(neg) body.negative_prompt=neg;
  const res=await call("/images/generations",body);
  const ext=style==="vector_illustration"&&!styleId?".svg":(styleId?".svg":".png");
  let i=0;
  for(const d of res.data){
    const buf=Buffer.from(await (await fetch(d.url)).arrayBuffer());
    // Indekset skal ind FOER endelsen, og "har stien en endelse?" skal spoerges
    // om filnavnet — ikke om hele stien. `--o /tmp/v0.6/rose` gav foer
    // `/tmp/v0.6/rose-1` helt uden endelse, fordi mappenavnet indeholdt et punktum.
    const harEndelse = basename(out).includes(".");
    const stamme = harEndelse ? out.slice(0, out.length-extname(out).length) : out;
    const endelse = harEndelse ? extname(out) : ext;
    const f = `${stamme}${n>1?"-"+(++i):""}${endelse}`;
    writeFileSync(f,buf); console.log(f, buf.length, "bytes");
  }
  const after=await credits();
  console.error(`credits ${before} -> ${after}  (-${before-after})`);
}
else if(cmd==="vectorize"){
  const before=await credits();
  const res=await call("/images/vectorize",{file:dataUrl(arg("--i")),response_format:"url"});
  const svg=await (await fetch(res.image.url)).text();
  writeFileSync(arg("--o"),svg); console.log(arg("--o"),svg.length,"bytes");
  console.error(`credits ${before} -> ${await credits()}`);
}
else console.log("styles | credits | create-style <filer> [--base X] | gen --p '..' --o ud [--n 4] [--style X] [--style-id X] [--model X] [--size WxH] | vectorize --i x.png --o x.svg");
